import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceApi } from '@/services/invoice/invoiceApi';
import { Invoice, InvoiceStats, InvoiceGenerationOptions } from '@/types';

interface UseInvoiceOptions {
  invoiceId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface InvoiceQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  customer_email?: string;
  date_from?: string;
  date_to?: string;
  overdue_only?: boolean;
  search?: string;
}

interface CreateInvoiceData {
  order_id?: string;
  customer: {
    name: string;
    company_name?: string;
    email?: string;
    phone?: string;
    national_id?: string;
    address?: string;
    city?: string;
    postal_code?: string;
  };
  line_items: Array<{
    item_id: string;
    item_type: 'course' | 'workshop' | 'product' | 'service';
    name: string;
    name_en?: string;
    description?: string;
    unit_price: number;
    quantity: number;
    discount_amount?: number;
    discount_percentage?: number;
  }>;
  due_date?: string;
  payment_terms?: string;
  notes?: string;
  locale?: string;
}

interface AddPaymentData {
  amount: number;
  payment_method: string;
  transaction_reference?: string;
  payment_date?: string;
  notes?: string;
}

export const useInvoice = (options: UseInvoiceOptions = {}) => {
  const { invoiceId, autoRefresh = false, refreshInterval = 30000 } = options;
  const queryClient = useQueryClient();

  // Query keys
  const QUERY_KEYS = {
    invoice: (id: string) => ['invoice', id],
    invoices: (params: InvoiceQueryParams) => ['invoices', params],
    stats: () => ['invoice-stats'],
    overdue: () => ['invoices', { overdue_only: true }],
    unpaid: () => ['invoices', { status: 'unpaid' }],
  };

  // Single invoice query
  const {
    data: invoice,
    isLoading: invoiceLoading,
    error: invoiceError,
    refetch: refetchInvoice
  } = useQuery({
    queryKey: QUERY_KEYS.invoice(invoiceId!),
    queryFn: () => invoiceApi.getInvoice(invoiceId!),
    enabled: !!invoiceId,
    refetchInterval: autoRefresh ? refreshInterval : false,
  });

  // Invoice statistics query
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: QUERY_KEYS.stats(),
    queryFn: invoiceApi.getInvoiceStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: (data: CreateInvoiceData) => invoiceApi.createInvoice(data),
    onSuccess: (newInvoice) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats() });

      // Add new invoice to cache
      queryClient.setQueryData(QUERY_KEYS.invoice(newInvoice._id), newInvoice);
    },
  });

  // Update invoice mutation
  const updateInvoiceMutation = useMutation({
    mutationFn: (data: { _id: string; [key: string]: any }) =>
      invoiceApi.updateInvoice(data),
    onSuccess: (updatedInvoice) => {
      // Update cache
      queryClient.setQueryData(QUERY_KEYS.invoice(updatedInvoice._id), updatedInvoice);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats() });
    },
  });

  // Add payment mutation
  const addPaymentMutation = useMutation({
    mutationFn: ({ invoiceId, ...paymentData }: AddPaymentData & { invoiceId: string }) =>
      invoiceApi.addPayment({ invoice_id: invoiceId, ...paymentData }),
    onSuccess: ({ invoice: updatedInvoice }) => {
      // Update cache
      queryClient.setQueryData(QUERY_KEYS.invoice(updatedInvoice._id), updatedInvoice);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats() });
    },
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: ({ invoiceId, emailType = 'new_invoice' }: {
      invoiceId: string;
      emailType?: string;
    }) => invoiceApi.sendInvoiceEmail(invoiceId, emailType),
    onSuccess: (_, { invoiceId }) => {
      // Refresh invoice data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoice(invoiceId) });
    },
  });

  // Mark as sent mutation
  const markAsSentMutation = useMutation({
    mutationFn: (invoiceId: string) => invoiceApi.markInvoiceAsSent(invoiceId),
    onSuccess: (_, invoiceId) => {
      // Refresh invoice data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.invoice(invoiceId) });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  // Generate from order mutation
  const generateFromOrderMutation = useMutation({
    mutationFn: (orderId: string) => invoiceApi.generateInvoiceFromOrder(orderId),
    onSuccess: (newInvoice) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats() });
      queryClient.setQueryData(QUERY_KEYS.invoice(newInvoice._id), newInvoice);
    },
  });

  // PDF generation with loading state
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const generatePDF = useCallback(async (
    invoiceId: string,
    options: InvoiceGenerationOptions = {}
  ) => {
    setPdfGenerating(true);
    setPdfError(null);

    try {
      const pdfBlob = await invoiceApi.generatePDF(invoiceId, options);
      return pdfBlob;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'PDF generation failed';
      setPdfError(errorMessage);
      throw error;
    } finally {
      setPdfGenerating(false);
    }
  }, []);

  const downloadPDF = useCallback(async (
    invoice: Invoice,
    options: InvoiceGenerationOptions = {}
  ) => {
    try {
      await invoiceApi.downloadInvoicePDF(invoice);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'PDF download failed';
      setPdfError(errorMessage);
      throw error;
    }
  }, []);

  // Bulk operations
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false);

  const bulkSendEmails = useCallback(async (invoiceIds: string[]) => {
    setBulkOperationLoading(true);
    try {
      const result = await invoiceApi.bulkSendEmails(invoiceIds);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      return result;
    } finally {
      setBulkOperationLoading(false);
    }
  }, [queryClient]);

  const bulkGeneratePDFs = useCallback(async (invoiceIds: string[]) => {
    setBulkOperationLoading(true);
    try {
      return await invoiceApi.bulkGeneratePDFs(invoiceIds);
    } finally {
      setBulkOperationLoading(false);
    }
  }, []);

  // Helper functions
  const isOverdue = useCallback((invoice: Invoice): boolean => {
    if (!invoice.due_date || invoice.status === 'paid') return false;
    return new Date(invoice.due_date) < new Date();
  }, []);

  const getDaysUntilDue = useCallback((invoice: Invoice): number | null => {
    if (!invoice.due_date) return null;
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, []);

  const getPaymentProgress = useCallback((invoice: Invoice) => {
    const percentage = invoice.total_amount > 0
      ? (invoice.paid_amount / invoice.total_amount) * 100
      : 0;

    return {
      percentage: Math.round(percentage * 100) / 100,
      remaining: Math.max(0, invoice.total_amount - invoice.paid_amount),
      isFullyPaid: invoice.balance_due <= 0.01,
      isPartiallyPaid: invoice.paid_amount > 0 && invoice.balance_due > 0.01
    };
  }, []);

  // Format helpers
  const formatCurrency = useCallback((amount: number, currency: string = 'IRR', locale: string = 'fa') => {
    try {
      if (locale === 'fa') {
        return new Intl.NumberFormat('fa-IR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount) + ' ریال';
      } else {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount);
      }
    } catch (error) {
      return `${amount} ${currency}`;
    }
  }, []);

  const formatDate = useCallback((date: Date | string, locale: string = 'fa') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    try {
      if (locale === 'fa') {
        return new Intl.DateTimeFormat('fa-IR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(dateObj);
      } else {
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }).format(dateObj);
      }
    } catch (error) {
      return dateObj.toLocaleDateString();
    }
  }, []);

  // Combined loading state
  const isLoading = useMemo(() => (
    invoiceLoading ||
    createInvoiceMutation.isPending ||
    updateInvoiceMutation.isPending ||
    addPaymentMutation.isPending ||
    sendEmailMutation.isPending ||
    markAsSentMutation.isPending ||
    generateFromOrderMutation.isPending ||
    bulkOperationLoading ||
    pdfGenerating
  ), [
    invoiceLoading,
    createInvoiceMutation.isPending,
    updateInvoiceMutation.isPending,
    addPaymentMutation.isPending,
    sendEmailMutation.isPending,
    markAsSentMutation.isPending,
    generateFromOrderMutation.isPending,
    bulkOperationLoading,
    pdfGenerating
  ]);

  // Combined error state
  const error = useMemo(() => (
    invoiceError ||
    statsError ||
    createInvoiceMutation.error ||
    updateInvoiceMutation.error ||
    addPaymentMutation.error ||
    sendEmailMutation.error ||
    markAsSentMutation.error ||
    generateFromOrderMutation.error ||
    pdfError
  ), [
    invoiceError,
    statsError,
    createInvoiceMutation.error,
    updateInvoiceMutation.error,
    addPaymentMutation.error,
    sendEmailMutation.error,
    markAsSentMutation.error,
    generateFromOrderMutation.error,
    pdfError
  ]);

  return {
    // Data
    invoice,
    stats,

    // Loading states
    isLoading,
    invoiceLoading,
    statsLoading,
    pdfGenerating,
    bulkOperationLoading,

    // Error states
    error,
    invoiceError,
    statsError,
    pdfError,

    // Mutations
    createInvoice: createInvoiceMutation.mutateAsync,
    updateInvoice: updateInvoiceMutation.mutateAsync,
    addPayment: addPaymentMutation.mutateAsync,
    sendEmail: sendEmailMutation.mutateAsync,
    markAsSent: markAsSentMutation.mutateAsync,
    generateFromOrder: generateFromOrderMutation.mutateAsync,

    // PDF operations
    generatePDF,
    downloadPDF,

    // Bulk operations
    bulkSendEmails,
    bulkGeneratePDFs,

    // Refresh functions
    refetchInvoice,
    refetchStats,

    // Helper functions
    isOverdue,
    getDaysUntilDue,
    getPaymentProgress,
    formatCurrency,
    formatDate,

    // Status flags
    isCreating: createInvoiceMutation.isPending,
    isUpdating: updateInvoiceMutation.isPending,
    isAddingPayment: addPaymentMutation.isPending,
    isSendingEmail: sendEmailMutation.isPending,
    isMarkingAsSent: markAsSentMutation.isPending,
    isGeneratingFromOrder: generateFromOrderMutation.isPending,
  };
};

// Hook for invoice list management
export const useInvoiceList = (params: InvoiceQueryParams = {}) => {
  const queryClient = useQueryClient();

  const {
    data: invoicesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoiceApi.getInvoices(params),
    keepPreviousData: true,
  });

  const searchInvoices = useMutation({
    mutationFn: (query: string) => invoiceApi.searchInvoices(query),
  });

  return {
    invoices: invoicesData?.invoices || [],
    pagination: invoicesData?.pagination,
    isLoading,
    error,
    refetch,
    searchInvoices: searchInvoices.mutateAsync,
    isSearching: searchInvoices.isPending,
    searchResults: searchInvoices.data,
  };
};

// Hook for overdue invoices
export const useOverdueInvoices = () => {
  const {
    data: overdueInvoices,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['invoices', { overdue_only: true }],
    queryFn: invoiceApi.getOverdueInvoices,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  return {
    overdueInvoices: overdueInvoices || [],
    count: overdueInvoices?.length || 0,
    isLoading,
    error,
    refetch,
  };
};

export default useInvoice;

import { Invoice, InvoiceStats, InvoiceGenerationOptions } from '@/types';

// API Response types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface InvoiceListResponse {
  invoices: Invoice[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
  };
}

interface CreateInvoiceRequest {
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

interface UpdateInvoiceRequest {
  _id: string;
  status?: string;
  customer?: Partial<{
    name: string;
    company_name: string;
    email: string;
    phone: string;
    national_id: string;
    address: string;
    city: string;
    postal_code: string;
  }>;
  due_date?: string;
  payment_terms?: string;
  notes?: string;
  admin_notes?: string;
}

interface AddPaymentRequest {
  invoice_id: string;
  amount: number;
  payment_method: string;
  transaction_reference?: string;
  payment_date?: string;
  notes?: string;
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

class InvoiceApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '/api';
  }

  // Helper method for making API calls
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Create a new invoice
  async createInvoice(invoiceData: CreateInvoiceRequest): Promise<Invoice> {
    const response = await this.makeRequest<{ invoice: Invoice }>('/invoice/create', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
    return response.invoice;
  }

  // Get invoice by ID
  async getInvoice(invoiceId: string): Promise<Invoice> {
    const response = await this.makeRequest<{ invoice: Invoice }>('/invoice/get', {
      method: 'POST',
      body: JSON.stringify({ _id: invoiceId }),
    });
    return response.invoice;
  }

  // Get invoices list with pagination and filters
  async getInvoices(params: InvoiceQueryParams = {}): Promise<InvoiceListResponse> {
    const response = await this.makeRequest<InvoiceListResponse>('/invoice/getList', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return response;
  }

  // Update invoice
  async updateInvoice(updateData: UpdateInvoiceRequest): Promise<Invoice> {
    const response = await this.makeRequest<{ invoice: Invoice }>('/invoice/update', {
      method: 'POST',
      body: JSON.stringify(updateData),
    });
    return response.invoice;
  }

  // Add payment to invoice
  async addPayment(paymentData: AddPaymentRequest): Promise<{
    invoice: Invoice;
    payment: any;
  }> {
    const response = await this.makeRequest<{
      invoice: Invoice;
      payment: any;
    }>('/invoice/addPayment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    return response;
  }

  // Generate invoice from order
  async generateInvoiceFromOrder(orderId: string): Promise<Invoice> {
    const response = await this.makeRequest<{ invoice: Invoice }>('/invoice/generateFromOrder', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    });
    return response.invoice;
  }

  // Mark invoice as sent (and send email)
  async markInvoiceAsSent(invoiceId: string): Promise<{ message: string }> {
    const response = await this.makeRequest<{ message: string }>('/invoice/markAsSent', {
      method: 'POST',
      body: JSON.stringify({ _id: invoiceId }),
    });
    return response;
  }

  // Get invoice statistics
  async getInvoiceStats(): Promise<InvoiceStats> {
    const response = await this.makeRequest<{ stats: InvoiceStats }>('/invoice/getStats', {
      method: 'POST',
    });
    return response.stats;
  }

  // Generate and download PDF
  async generatePDF(
    invoiceId: string,
    options: InvoiceGenerationOptions = {}
  ): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (options.template) queryParams.append('template', options.template);
    if (options.language) queryParams.append('language', options.language);

    const url = `/api/invoice/pdf/${invoiceId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to generate PDF: ${response.statusText}`);
    }

    return response.blob();
  }

  // Send invoice email
  async sendInvoiceEmail(invoiceId: string, emailType: string = 'new_invoice'): Promise<{ message: string }> {
    const response = await this.makeRequest<{ message: string }>('/invoice/send-email', {
      method: 'POST',
      body: JSON.stringify({
        _id: invoiceId,
        email_type: emailType
      }),
    });
    return response;
  }

  // Download invoice PDF
  async downloadInvoicePDF(invoice: Invoice): Promise<void> {
    try {
      const pdfBlob = await this.generatePDF(invoice._id);
      const url = window.URL.createObjectURL(pdfBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkSendEmails(invoiceIds: string[]): Promise<{
    total: number;
    successful: number;
    failed: number;
    results: any[];
  }> {
    const response = await this.makeRequest<{
      total: number;
      successful: number;
      failed: number;
      results: any[];
    }>('/invoice/bulk-send-emails', {
      method: 'POST',
      body: JSON.stringify({ invoice_ids: invoiceIds }),
    });
    return response;
  }

  async bulkGeneratePDFs(invoiceIds: string[]): Promise<Blob> {
    const response = await fetch('/api/invoice/bulk-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ invoice_ids: invoiceIds }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate bulk PDFs: ${response.statusText}`);
    }

    return response.blob();
  }

  // Search invoices
  async searchInvoices(query: string): Promise<Invoice[]> {
    const response = await this.makeRequest<{ invoices: Invoice[] }>('/invoice/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
    return response.invoices;
  }

  // Get overdue invoices
  async getOverdueInvoices(): Promise<Invoice[]> {
    const response = await this.getInvoices({ overdue_only: true });
    return response.invoices;
  }

  // Get unpaid invoices
  async getUnpaidInvoices(): Promise<Invoice[]> {
    const params: InvoiceQueryParams = {
      status: 'sent,viewed,partially_paid,overdue'
    };
    const response = await this.getInvoices(params);
    return response.invoices;
  }

  // Cancel invoice
  async cancelInvoice(invoiceId: string, reason?: string): Promise<Invoice> {
    const response = await this.makeRequest<{ invoice: Invoice }>('/invoice/cancel', {
      method: 'POST',
      body: JSON.stringify({
        _id: invoiceId,
        reason: reason
      }),
    });
    return response.invoice;
  }

  // Refund invoice
  async refundInvoice(invoiceId: string, refundData: {
    amount: number;
    reason: string;
    refund_method?: string;
  }): Promise<Invoice> {
    const response = await this.makeRequest<{ invoice: Invoice }>('/invoice/refund', {
      method: 'POST',
      body: JSON.stringify({
        _id: invoiceId,
        ...refundData
      }),
    });
    return response.invoice;
  }

  // Get payment history for invoice
  async getPaymentHistory(invoiceId: string): Promise<any[]> {
    const invoice = await this.getInvoice(invoiceId);
    return invoice.payments || [];
  }

  // Validate invoice data
  async validateInvoiceData(invoiceData: Partial<CreateInvoiceRequest>): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const response = await this.makeRequest<{
      valid: boolean;
      errors: string[];
    }>('/invoice/validate', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
    return response;
  }

  // Get invoice templates
  async getInvoiceTemplates(): Promise<{
    id: string;
    name: string;
    description: string;
    preview_url: string;
  }[]> {
    const response = await this.makeRequest<{
      templates: {
        id: string;
        name: string;
        description: string;
        preview_url: string;
      }[];
    }>('/invoice/templates', {
      method: 'GET',
    });
    return response.templates;
  }

  // Get invoice by number
  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice> {
    const response = await this.makeRequest<{ invoice: Invoice }>('/invoice/get-by-number', {
      method: 'POST',
      body: JSON.stringify({ invoice_number: invoiceNumber }),
    });
    return response.invoice;
  }

  // Check if invoice number exists
  async checkInvoiceNumberExists(invoiceNumber: string): Promise<boolean> {
    try {
      await this.getInvoiceByNumber(invoiceNumber);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get next invoice number
  async getNextInvoiceNumber(): Promise<string> {
    const response = await this.makeRequest<{ invoice_number: string }>('/invoice/next-number', {
      method: 'GET',
    });
    return response.invoice_number;
  }
}

// Create singleton instance
export const invoiceApi = new InvoiceApiService();

// Export individual functions for easier importing
export const {
  createInvoice,
  getInvoice,
  getInvoices,
  updateInvoice,
  addPayment,
  generateInvoiceFromOrder,
  markInvoiceAsSent,
  getInvoiceStats,
  generatePDF,
  sendInvoiceEmail,
  downloadInvoicePDF,
  bulkSendEmails,
  bulkGeneratePDFs,
  searchInvoices,
  getOverdueInvoices,
  getUnpaidInvoices,
  cancelInvoice,
  refundInvoice,
  getPaymentHistory,
  validateInvoiceData,
  getInvoiceTemplates,
  getInvoiceByNumber,
  checkInvoiceNumberExists,
  getNextInvoiceNumber,
} = invoiceApi;

export default invoiceApi;

import type {
  ManualPayment,
  CreateManualPaymentRequest,
  UpdateManualPaymentRequest,
  ManualPaymentQuery,
  ManualPaymentHistoryResponse,
  ManualPaymentApiResponse,
  ManualPaymentStatus,
} from "@/types";

// Utility function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock manual payments data for development
const mockManualPayments: ManualPayment[] = [
  {
    _id: "mp_001",
    user_id: "user_1",
    admin_id: "admin_1",
    title: "پرداخت ثبت نام کارگاه روانشناسی",
    description: "هزینه ثبت نام در کارگاه مدیریت استرس و اضطراب",
    amount: 2500000,
    currency: "IRR",
    status: "pending",
    payment_deadline: "2024-02-15T23:59:59.000Z",
    related_workshop_id: "workshop_1",
    payment_instructions: "لطفاً مبلغ را به حساب شماره ۱۲۳۴۵۶۷۸۹۰ واریز کرده و فیش واریزی را ارسال کنید.",
    admin_notes: "کاربر درخواست تخفیف دانشجویی داده است",
    created_at: "2024-01-15T10:00:00.000Z",
    updated_at: "2024-01-15T10:00:00.000Z",
  },
  {
    _id: "mp_002",
    user_id: "user_2",
    admin_id: "admin_1",
    title: "خرید کتاب تخصصی روانشناسی",
    description: "هزینه خرید کتاب 'مبانی روانشناسی بالینی'",
    amount: 850000,
    currency: "IRR",
    status: "approved",
    related_product_id: "product_1",
    payment_instructions: "پرداخت نقدی در محل دانشگاه",
    proof_of_payment: {
      file_url: "/uploads/receipts/receipt_002.jpg",
      file_name: "receipt_payment.jpg",
      uploaded_at: "2024-01-14T14:30:00.000Z",
    },
    approved_at: "2024-01-14T16:00:00.000Z",
    approved_by: "admin_1",
    created_at: "2024-01-10T09:00:00.000Z",
    updated_at: "2024-01-14T16:00:00.000Z",
  },
  {
    _id: "mp_003",
    user_id: "user_3",
    admin_id: "admin_2",
    title: "هزینه دوره آنلاین CBT",
    description: "پرداخت اقساطی برای دوره شناخت درمانی",
    amount: 4200000,
    currency: "IRR",
    status: "rejected",
    payment_deadline: "2024-01-20T23:59:59.000Z",
    rejection_reason: "مدارک ارسالی کامل نبود",
    rejected_at: "2024-01-16T11:00:00.000Z",
    rejected_by: "admin_2",
    user_notes: "لطفاً مهلت بیشتری بدهید",
    created_at: "2024-01-12T13:00:00.000Z",
    updated_at: "2024-01-16T11:00:00.000Z",
  },
  {
    _id: "mp_004",
    user_id: "user_1",
    admin_id: "admin_1",
    title: "هزینه مشاوره تخصصی",
    description: "پرداخت جلسات مشاوره فردی",
    amount: 1800000,
    currency: "IRR",
    status: "cancelled",
    payment_instructions: "پرداخت آنلاین از طریق درگاه بانک",
    admin_notes: "کاربر درخواست لغو داد",
    created_at: "2024-01-08T15:00:00.000Z",
    updated_at: "2024-01-10T12:00:00.000Z",
  },
];

// Mock users for reference
const mockUsers = [
  { id: "user_1", name: "علی احمدی", phone: "+989123456789", email: "ali@example.com" },
  { id: "user_2", name: "فاطمه رضایی", phone: "+989987654321", email: "fateme@example.com" },
  { id: "user_3", name: "محمد کریمی", phone: "+989111222333", email: "mohammad@example.com" },
];

// Generate unique ID for new payments
const generatePaymentId = (): string => {
  return `mp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const manualPaymentApi = {
  // Create manual payment (Admin only)
  async createManualPayment(
    request: CreateManualPaymentRequest
  ): Promise<ManualPaymentApiResponse<ManualPayment>> {
    await delay(800);

    try {
      // Validate required fields
      if (!request.user_id || !request.title || !request.description || !request.amount) {
        return {
          success: false,
          error: "اطلاعات الزامی کامل نیست",
        };
      }

      // Check if user exists
      const user = mockUsers.find(u => u.id === request.user_id);
      if (!user) {
        return {
          success: false,
          error: "کاربر مورد نظر یافت نشد",
        };
      }

      // Validate amount
      if (request.amount <= 0) {
        return {
          success: false,
          error: "مبلغ باید بیشتر از صفر باشد",
        };
      }

      // Create new manual payment
      const newPayment: ManualPayment = {
        _id: generatePaymentId(),
        user_id: request.user_id,
        admin_id: "admin_1", // In real app, this would come from auth context
        title: request.title,
        description: request.description,
        amount: request.amount,
        currency: "IRR",
        status: "pending",
        payment_deadline: request.payment_deadline,
        related_order_id: request.related_order_id,
        related_workshop_id: request.related_workshop_id,
        related_product_id: request.related_product_id,
        payment_instructions: request.payment_instructions || "لطفاً با پشتیبانی تماس بگیرید",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add to mock data
      mockManualPayments.unshift(newPayment);

      return {
        success: true,
        data: newPayment,
      };
    } catch (error) {
      console.error("Error creating manual payment:", error);
      return {
        success: false,
        error: "خطا در ایجاد درخواست پرداخت",
      };
    }
  },

  // Get manual payment by ID
  async getManualPayment(
    paymentId: string
  ): Promise<ManualPaymentApiResponse<ManualPayment>> {
    await delay(500);

    try {
      const payment = mockManualPayments.find(p => p._id === paymentId);

      if (!payment) {
        return {
          success: false,
          error: "درخواست پرداخت یافت نشد",
        };
      }

      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      console.error("Error getting manual payment:", error);
      return {
        success: false,
        error: "خطا در دریافت اطلاعات پرداخت",
      };
    }
  },

  // Get manual payments with filtering
  async getManualPayments(
    query: ManualPaymentQuery = {}
  ): Promise<ManualPaymentApiResponse<ManualPaymentHistoryResponse>> {
    await delay(700);

    try {
      let filteredPayments = [...mockManualPayments];

      // Apply filters
      if (query.user_id) {
        filteredPayments = filteredPayments.filter(p => p.user_id === query.user_id);
      }

      if (query.admin_id) {
        filteredPayments = filteredPayments.filter(p => p.admin_id === query.admin_id);
      }

      if (query.status) {
        filteredPayments = filteredPayments.filter(p => p.status === query.status);
      }

      if (query.date_from) {
        filteredPayments = filteredPayments.filter(
          p => new Date(p.created_at) >= new Date(query.date_from!)
        );
      }

      if (query.date_to) {
        filteredPayments = filteredPayments.filter(
          p => new Date(p.created_at) <= new Date(query.date_to!)
        );
      }

      if (query.amount_min) {
        filteredPayments = filteredPayments.filter(p => p.amount >= query.amount_min!);
      }

      if (query.amount_max) {
        filteredPayments = filteredPayments.filter(p => p.amount <= query.amount_max!);
      }

      // Sort by created_at descending
      filteredPayments.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Pagination
      const page = query.page || 1;
      const limit = query.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

      // Calculate statistics
      const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
      const statusCounts = {
        pending: filteredPayments.filter(p => p.status === 'pending').length,
        approved: filteredPayments.filter(p => p.status === 'approved').length,
        rejected: filteredPayments.filter(p => p.status === 'rejected').length,
        cancelled: filteredPayments.filter(p => p.status === 'cancelled').length,
      };

      return {
        success: true,
        data: {
          payments: paginatedPayments,
          total_count: filteredPayments.length,
          page,
          limit,
          total_pages: Math.ceil(filteredPayments.length / limit),
          total_amount: totalAmount,
          status_counts: statusCounts,
        },
      };
    } catch (error) {
      console.error("Error getting manual payments:", error);
      return {
        success: false,
        error: "خطا در دریافت لیست پرداخت‌ها",
      };
    }
  },

  // Update manual payment status (Admin only)
  async updateManualPayment(
    paymentId: string,
    request: UpdateManualPaymentRequest
  ): Promise<ManualPaymentApiResponse<ManualPayment>> {
    await delay(600);

    try {
      const paymentIndex = mockManualPayments.findIndex(p => p._id === paymentId);

      if (paymentIndex === -1) {
        return {
          success: false,
          error: "درخواست پرداخت یافت نشد",
        };
      }

      const payment = mockManualPayments[paymentIndex];

      // Validate status transitions
      if (request.status) {
        if (payment.status === 'approved' && request.status !== 'cancelled') {
          return {
            success: false,
            error: "پرداخت تأیید شده را نمی‌توان تغییر داد",
          };
        }

        if (request.status === 'rejected' && !request.rejection_reason) {
          return {
            success: false,
            error: "لطفاً دلیل رد درخواست را وارد کنید",
          };
        }
      }

      // Update payment
      const updatedPayment = {
        ...payment,
        status: request.status || payment.status,
        admin_notes: request.admin_notes || payment.admin_notes,
        payment_instructions: request.payment_instructions || payment.payment_instructions,
        rejection_reason: request.rejection_reason || payment.rejection_reason,
        updated_at: new Date().toISOString(),
      };

      // Add timestamps for status changes
      if (request.status === 'approved' && payment.status !== 'approved') {
        updatedPayment.approved_at = new Date().toISOString();
        updatedPayment.approved_by = "admin_1"; // In real app, from auth context
      }

      if (request.status === 'rejected' && payment.status !== 'rejected') {
        updatedPayment.rejected_at = new Date().toISOString();
        updatedPayment.rejected_by = "admin_1"; // In real app, from auth context
      }

      // Update in mock data
      mockManualPayments[paymentIndex] = updatedPayment;

      return {
        success: true,
        data: updatedPayment,
      };
    } catch (error) {
      console.error("Error updating manual payment:", error);
      return {
        success: false,
        error: "خطا در به‌روزرسانی پرداخت",
      };
    }
  },

  // Upload proof of payment (User action)
  async uploadProofOfPayment(
    paymentId: string,
    file: File,
    userNotes?: string
  ): Promise<ManualPaymentApiResponse<ManualPayment>> {
    await delay(1200); // Simulate file upload delay

    try {
      const paymentIndex = mockManualPayments.findIndex(p => p._id === paymentId);

      if (paymentIndex === -1) {
        return {
          success: false,
          error: "درخواست پرداخت یافت نشد",
        };
      }

      const payment = mockManualPayments[paymentIndex];

      // Validate file
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return {
          success: false,
          error: "حجم فایل نباید بیشتر از ۵ مگابایت باشد",
        };
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: "فرمت فایل باید JPG، PNG یا PDF باشد",
        };
      }

      // Simulate file upload to server
      const fileUrl = `/uploads/receipts/${paymentId}_${Date.now()}_${file.name}`;

      // Update payment with proof
      const updatedPayment = {
        ...payment,
        proof_of_payment: {
          file_url: fileUrl,
          file_name: file.name,
          uploaded_at: new Date().toISOString(),
        },
        user_notes: userNotes || payment.user_notes,
        updated_at: new Date().toISOString(),
      };

      // Update in mock data
      mockManualPayments[paymentIndex] = updatedPayment;

      return {
        success: true,
        data: updatedPayment,
      };
    } catch (error) {
      console.error("Error uploading proof of payment:", error);
      return {
        success: false,
        error: "خطا در آپلود فیش پرداخت",
      };
    }
  },

  // Delete manual payment (Admin only)
  async deleteManualPayment(
    paymentId: string
  ): Promise<ManualPaymentApiResponse<{ deleted: boolean }>> {
    await delay(500);

    try {
      const paymentIndex = mockManualPayments.findIndex(p => p._id === paymentId);

      if (paymentIndex === -1) {
        return {
          success: false,
          error: "درخواست پرداخت یافت نشد",
        };
      }

      const payment = mockManualPayments[paymentIndex];

      // Check if can delete
      if (payment.status === 'approved') {
        return {
          success: false,
          error: "پرداخت تأیید شده را نمی‌توان حذف کرد",
        };
      }

      // Remove from mock data
      mockManualPayments.splice(paymentIndex, 1);

      return {
        success: true,
        data: { deleted: true },
      };
    } catch (error) {
      console.error("Error deleting manual payment:", error);
      return {
        success: false,
        error: "خطا در حذف درخواست پرداخت",
      };
    }
  },

  // Get payment statistics (Admin only)
  async getPaymentStatistics(
    dateFrom?: string,
    dateTo?: string
  ): Promise<ManualPaymentApiResponse<{
    total_payments: number;
    total_amount: number;
    pending_count: number;
    approved_count: number;
    rejected_count: number;
    cancelled_count: number;
    pending_amount: number;
    approved_amount: number;
    monthly_stats: Array<{
      month: string;
      count: number;
      amount: number;
    }>;
  }>> {
    await delay(600);

    try {
      let filteredPayments = [...mockManualPayments];

      // Apply date filters
      if (dateFrom) {
        filteredPayments = filteredPayments.filter(
          p => new Date(p.created_at) >= new Date(dateFrom)
        );
      }

      if (dateTo) {
        filteredPayments = filteredPayments.filter(
          p => new Date(p.created_at) <= new Date(dateTo)
        );
      }

      // Calculate statistics
      const totalPayments = filteredPayments.length;
      const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

      const statusCounts = {
        pending: filteredPayments.filter(p => p.status === 'pending').length,
        approved: filteredPayments.filter(p => p.status === 'approved').length,
        rejected: filteredPayments.filter(p => p.status === 'rejected').length,
        cancelled: filteredPayments.filter(p => p.status === 'cancelled').length,
      };

      const pendingAmount = filteredPayments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

      const approvedAmount = filteredPayments
        .filter(p => p.status === 'approved')
        .reduce((sum, p) => sum + p.amount, 0);

      // Calculate monthly stats
      const monthlyStats = new Map();
      filteredPayments.forEach(payment => {
        const date = new Date(payment.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyStats.has(monthKey)) {
          monthlyStats.set(monthKey, { count: 0, amount: 0 });
        }

        const stats = monthlyStats.get(monthKey);
        stats.count += 1;
        stats.amount += payment.amount;
      });

      const monthlyStatsArray = Array.from(monthlyStats.entries()).map(([month, stats]) => ({
        month,
        count: stats.count,
        amount: stats.amount,
      }));

      return {
        success: true,
        data: {
          total_payments: totalPayments,
          total_amount: totalAmount,
          pending_count: statusCounts.pending,
          approved_count: statusCounts.approved,
          rejected_count: statusCounts.rejected,
          cancelled_count: statusCounts.cancelled,
          pending_amount: pendingAmount,
          approved_amount: approvedAmount,
          monthly_stats: monthlyStatsArray,
        },
      };
    } catch (error) {
      console.error("Error getting payment statistics:", error);
      return {
        success: false,
        error: "خطا در دریافت آمار پرداخت‌ها",
      };
    }
  },
};

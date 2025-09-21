import type { ActFn } from "@deps";
import { throwError } from "@lib";
import { myRedis, user, booking } from "../../../mod.ts";
import { smsService, SMSService } from "../smsService.ts";

// Booking SMS constants
const BOOKING_SMS_RATE_LIMIT = 10; // Maximum booking SMS per day per mobile
const RATE_LIMIT_WINDOW = 86400; // 24 hours in seconds

// SMS templates for different booking events
const BOOKING_SMS_TEMPLATES = {
  confirmation: (data: BookingData) => {
    const { customerName, courseTitle, bookingDate, bookingTime, location, bookingId, amount } = data;
    return `${customerName ? `${customerName} عزیز` : 'کاربر گرامی'}
رزرو شما با موفقیت ثبت شد.

📚 دوره: ${courseTitle}
📅 تاریخ: ${formatPersianDate(bookingDate)}
🕐 ساعت: ${bookingTime}
📍 مکان: ${location || 'آنلاین'}
💰 مبلغ: ${formatAmount(amount)} تومان
🔢 کد رزرو: ${bookingId}

مرکز معماری ایرانی`;
  },

  reminder_24h: (data: BookingData) => {
    const { customerName, courseTitle, bookingDate, bookingTime, location, instructorName } = data;
    return `${customerName ? `${customerName} عزیز` : 'کاربر گرامی'}
یادآوری: کلاس شما 24 ساعت دیگر شروع می‌شود.

📚 دوره: ${courseTitle}
📅 فردا ${formatPersianDate(bookingDate)}
🕐 ساعت: ${bookingTime}
👨‍🏫 مدرس: ${instructorName || 'اعلام خواهد شد'}
📍 مکان: ${location || 'آنلاین'}

آماده باشید!
مرکز معماری ایرانی`;
  },

  reminder_2h: (data: BookingData) => {
    const { customerName, courseTitle, bookingTime, location, instructorName } = data;
    return `${customerName ? `${customerName} عزیز` : 'کاربر گرامی'}
⚠️ کلاس شما 2 ساعت دیگر شروع می‌شود.

📚 ${courseTitle}
🕐 ساعت ${bookingTime}
👨‍🏫 ${instructorName || 'مدرس'}
📍 ${location || 'آنلاین'}

لطفاً آماده باشید.
مرکز معماری ایرانی`;
  },

  cancellation: (data: BookingData) => {
    const { customerName, courseTitle, bookingDate, bookingId, refundAmount } = data;
    return `${customerName ? `${customerName} عزیز` : 'کاربر گرامی'}
رزرو شما لغو شد.

📚 دوره: ${courseTitle}
📅 تاریخ: ${formatPersianDate(bookingDate)}
🔢 کد رزرو: ${bookingId}
${refundAmount ? `💰 مبلغ بازگردانی: ${formatAmount(refundAmount)} تومان` : ''}

برای سوالات با پشتیبانی تماس بگیرید.
مرکز معماری ایرانی`;
  },

  reschedule: (data: BookingData) => {
    const { customerName, courseTitle, bookingDate, bookingTime, location, oldDate, oldTime } = data;
    return `${customerName ? `${customerName} عزیز` : 'کاربر گرامی'}
زمان کلاس شما تغییر یافت.

📚 دوره: ${courseTitle}

زمان قبلی:
📅 ${formatPersianDate(oldDate)}
🕐 ${oldTime}

زمان جدید:
📅 ${formatPersianDate(bookingDate)}
🕐 ${bookingTime}
📍 ${location || 'آنلاین'}

مرکز معماری ایرانی`;
  },

  completion: (data: BookingData) => {
    const { customerName, courseTitle, bookingDate, instructorName, certificateUrl } = data;
    return `${customerName ? `${customerName} عزیز` : 'کاربر گرامی'}
کلاس شما با موفقیت تکمیل شد.

📚 دوره: ${courseTitle}
📅 تاریخ: ${formatPersianDate(bookingDate)}
👨‍🏫 مدرس: ${instructorName}
${certificateUrl ? `📜 گواهی: ${certificateUrl}` : ''}

از شرکت شما متشکریم.
نظر خود را با ما در میان بگذارید.
مرکز معماری ایرانی`;
  },
};

interface BookingData {
  bookingId: string;
  customerName?: string;
  courseTitle?: string;
  bookingDate?: Date;
  bookingTime?: string;
  instructorName?: string;
  location?: string;
  amount?: number;
  refundAmount?: number;
  oldDate?: Date;
  oldTime?: string;
  certificateUrl?: string;
}

export const sendBookingReminderFn: ActFn = async (body) => {
  const {
    set: {
      booking_id,
      mobile,
      user_id,
      reminder_type,
      course_title,
      booking_date,
      booking_time,
      instructor_name,
      location,
      amount,
      locale = "fa"
    },
    get,
  } = body.details;

  try {
    // Find booking details if not provided
    const bookingData = await getBookingData(
      booking_id,
      mobile,
      user_id,
      {
        course_title,
        booking_date,
        booking_time,
        instructor_name,
        location,
        amount: amount ? parseFloat(amount) : undefined,
      }
    );

    if (!bookingData.mobile) {
      return throwError("شماره موبایل یافت نشد");
    }

    // Check rate limiting
    await checkBookingRateLimit(bookingData.mobile);

    // Generate SMS message
    const smsMessage = generateBookingMessage(reminder_type, bookingData);

    // Send SMS
    const smsResult = await smsService.sendSMS({
      to: bookingData.mobile,
      message: smsMessage,
      template_id: `booking_${reminder_type}`,
    });

    if (!smsResult.success) {
      console.error("Booking SMS send failed:", smsResult.error);
      return throwError(smsResult.error || "خطا در ارسال پیامک");
    }

    // Update rate limiting
    await updateBookingRateLimit(bookingData.mobile);

    // Schedule future reminders if needed
    const scheduledReminders = await scheduleBookingReminders(
      booking_id,
      reminder_type,
      bookingData
    );

    // Log booking SMS event
    await logBookingEvent("sms_sent", {
      booking_id,
      mobile: maskMobile(bookingData.mobile),
      reminder_type,
      user_id: bookingData.userId,
      message_id: smsResult.message_id,
    });

    // Store SMS history
    await storeBookingSMSHistory(booking_id, {
      type: reminder_type,
      mobile: bookingData.mobile,
      message: smsMessage,
      sent_at: new Date(),
      status: "sent",
      message_id: smsResult.message_id,
    });

    // Return response
    if (get) {
      return {
        booking_id,
        mobile: maskMobile(bookingData.mobile),
        reminder_type,
        message_sent: "بله",
        scheduled_reminders: scheduledReminders.length.toString(),
        next_reminder_at: scheduledReminders.length > 0
          ? scheduledReminders[0].scheduled_at.toISOString()
          : undefined,
        message: "پیامک رزرو ارسال شد",
      };
    }

    return {
      success: true,
      message: "پیامک رزرو ارسال شد",
      scheduled_reminders: scheduledReminders.length
    };

  } catch (error) {
    console.error("Booking reminder error:", error);

    if (error.message.includes("حداکثر") ||
      error.message.includes("یافت نشد") ||
      error.message.includes("نامعتبر")) {
      return throwError(error.message);
    }

    return throwError("خطا در ارسال پیامک رزرو");
  }
};

// Helper functions

async function getBookingData(
  bookingId: string,
  mobile?: string,
  userId?: string,
  providedData?: Partial<BookingData>
): Promise<BookingData & { mobile: string; userId?: string }> {
  try {
    // Try to find booking in database
    const foundBooking = await booking.findOne({
      filters: { _id: bookingId },
      projection: {
        _id: 1,
        user: 1,
        course: 1,
        booking_date: 1,
        booking_time: 1,
        status: 1,
        amount: 1,
        location: 1,
      }
    });

    let userMobile = mobile;
    let customerName = "";
    let bookingUserId = userId;

    // If booking found, get user details
    if (foundBooking && foundBooking.user) {
      const foundUser = await user.findOne({
        filters: { _id: foundBooking.user },
        projection: {
          _id: 1,
          mobile: 1,
          first_name: 1,
          last_name: 1,
        }
      });

      if (foundUser) {
        userMobile = foundUser.mobile;
        customerName = `${foundUser.first_name || ''} ${foundUser.last_name || ''}`.trim();
        bookingUserId = foundUser._id;
      }
    } else if (userId && !userMobile) {
      // Find user by ID to get mobile
      const foundUser = await user.findOne({
        filters: { _id: userId },
        projection: { mobile: 1, first_name: 1, last_name: 1 }
      });

      if (foundUser) {
        userMobile = foundUser.mobile;
        customerName = `${foundUser.first_name || ''} ${foundUser.last_name || ''}`.trim();
      }
    }

    if (!userMobile) {
      throw new Error("شماره موبایل کاربر یافت نشد");
    }

    // Combine data from database and provided data
    return {
      bookingId,
      mobile: normalizeMobile(userMobile),
      userId: bookingUserId,
      customerName,
      courseTitle: providedData?.course_title || foundBooking?.course?.title || "دوره",
      bookingDate: providedData?.booking_date || foundBooking?.booking_date,
      bookingTime: providedData?.booking_time || foundBooking?.booking_time,
      instructorName: providedData?.instructor_name,
      location: providedData?.location || foundBooking?.location,
      amount: providedData?.amount || foundBooking?.amount,
    };

  } catch (error) {
    console.error("Error getting booking data:", error);
    throw new Error("خطا در دریافت اطلاعات رزرو");
  }
}

function generateBookingMessage(reminderType: string, data: BookingData): string {
  const template = BOOKING_SMS_TEMPLATES[reminderType as keyof typeof BOOKING_SMS_TEMPLATES];

  if (!template) {
    return `اطلاع‌رسانی رزرو شما: ${data.bookingId}
مرکز معماری ایرانی`;
  }

  return template(data);
}

async function scheduleBookingReminders(
  bookingId: string,
  currentType: string,
  data: BookingData
): Promise<Array<{ type: string; scheduled_at: Date }>> {
  const scheduledReminders: Array<{ type: string; scheduled_at: Date }> = [];

  // Only schedule future reminders for confirmation
  if (currentType === "confirmation" && data.bookingDate) {
    const bookingDateTime = new Date(data.bookingDate);
    const now = new Date();

    // Schedule 24 hour reminder
    const reminder24h = new Date(bookingDateTime.getTime() - (24 * 60 * 60 * 1000));
    if (reminder24h > now) {
      scheduledReminders.push({
        type: "reminder_24h",
        scheduled_at: reminder24h
      });

      // Store in Redis for background job processing
      await myRedis.set(
        `booking:reminder:${bookingId}:24h`,
        JSON.stringify({
          booking_id: bookingId,
          reminder_type: "reminder_24h",
          scheduled_at: reminder24h.toISOString(),
          mobile: data.mobile,
        }),
        { exat: Math.floor(reminder24h.getTime() / 1000) }
      );
    }

    // Schedule 2 hour reminder
    const reminder2h = new Date(bookingDateTime.getTime() - (2 * 60 * 60 * 1000));
    if (reminder2h > now) {
      scheduledReminders.push({
        type: "reminder_2h",
        scheduled_at: reminder2h
      });

      // Store in Redis
      await myRedis.set(
        `booking:reminder:${bookingId}:2h`,
        JSON.stringify({
          booking_id: bookingId,
          reminder_type: "reminder_2h",
          scheduled_at: reminder2h.toISOString(),
          mobile: data.mobile,
        }),
        { exat: Math.floor(reminder2h.getTime() / 1000) }
      );
    }
  }

  return scheduledReminders;
}

async function storeBookingSMSHistory(
  bookingId: string,
  smsData: {
    type: string;
    mobile: string;
    message: string;
    sent_at: Date;
    status: string;
    message_id?: string;
  }
): Promise<void> {
  const historyKey = `booking:sms_history:${bookingId}`;

  try {
    await myRedis.lpush(
      historyKey,
      JSON.stringify({
        ...smsData,
        mobile: maskMobile(smsData.mobile), // Store masked mobile for privacy
      })
    );

    // Keep only last 20 SMS records per booking
    await myRedis.ltrim(historyKey, 0, 19);

    // Set expiry for SMS history (6 months)
    await myRedis.expire(historyKey, 86400 * 180);

  } catch (error) {
    console.error("Failed to store SMS history:", error);
  }
}

function formatPersianDate(date?: Date): string {
  if (!date) return "تاریخ نامشخص";

  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }).format(date);
  } catch {
    return date.toLocaleDateString('fa-IR');
  }
}

function formatAmount(amount?: number): string {
  if (!amount) return "0";
  return amount.toLocaleString('fa-IR');
}

function normalizeMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");

  if (digits.startsWith("98") && digits.length === 12) {
    return digits;
  } else if (digits.startsWith("0") && digits.length === 11) {
    return `98${digits.substring(1)}`;
  } else if (digits.length === 10 && digits.startsWith("9")) {
    return `98${digits}`;
  }

  return digits;
}

function maskMobile(mobile: string): string {
  if (mobile.length >= 8) {
    const start = mobile.slice(0, 4);
    const end = mobile.slice(-3);
    const masked = "*".repeat(mobile.length - 7);
    return `${start}${masked}${end}`;
  }
  return mobile;
}

async function checkBookingRateLimit(mobile: string): Promise<void> {
  const rateLimitKey = `booking:sms_rate:${mobile}`;
  const currentCount = await myRedis.get(rateLimitKey);

  if (currentCount && parseInt(currentCount) >= BOOKING_SMS_RATE_LIMIT) {
    const ttl = await myRedis.ttl(rateLimitKey);
    const hours = Math.ceil(ttl / 3600);
    throw new Error(`حداکثر تعداد پیامک رزرو در 24 ساعت گذشته رسیده است. ${hours} ساعت تا ارسال مجدد`);
  }
}

async function updateBookingRateLimit(mobile: string): Promise<void> {
  const rateLimitKey = `booking:sms_rate:${mobile}`;
  const currentCount = await myRedis.get(rateLimitKey);

  if (currentCount) {
    await myRedis.incr(rateLimitKey);
  } else {
    await myRedis.set(rateLimitKey, "1", { ex: RATE_LIMIT_WINDOW });
  }
}

async function logBookingEvent(
  event: string,
  details: Record<string, any>
): Promise<void> {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    details,
  };

  console.log("Booking SMS Event:", JSON.stringify(logData));

  try {
    await myRedis.lpush(
      "booking:sms_events",
      JSON.stringify(logData)
    );
    await myRedis.ltrim("booking:sms_events", 0, 999);
  } catch (error) {
    console.error("Failed to log booking event:", error);
  }
}

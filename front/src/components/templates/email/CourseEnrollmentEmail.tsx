"use client";

interface EmailTemplateProps {
  locale: 'fa' | 'en';
  data: {
    userName: string;
    courseName: string;
    courseNameFa?: string;
    courseNameEn?: string;
    startDate: string;
    endDate?: string;
    instructor?: string;
    instructorFa?: string;
    instructorEn?: string;
    amount?: string;
    currency?: string;
    enrollmentDate?: string;
    courseUrl?: string;
    dashboardUrl?: string;
    supportEmail?: string;
    courseDuration?: string;
    courseSchedule?: string;
  };
}

export const CourseEnrollmentEmail = ({ locale, data }: EmailTemplateProps) => {
  const isRTL = locale === 'fa';

  const courseName = locale === 'fa'
    ? (data.courseNameFa || data.courseName)
    : (data.courseNameEn || data.courseName);

  const instructor = locale === 'fa'
    ? (data.instructorFa || data.instructor)
    : (data.instructorEn || data.instructor);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (locale === 'fa') {
      return date.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    }
  };

  return (
    <div
      className={`flex flex-col max-w-2xl mx-auto font-sans ${isRTL ? 'rtl' : 'ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isRTL ? 'Vazirmatn, Arial, sans-serif' : 'Arial, sans-serif',
        lineHeight: '1.6',
        color: '#3D3D3D'
      }}
    >
      {/* Email Header */}
      <div
        className="flex items-center justify-center p-8 text-white"
        style={{ backgroundColor: '#168c95' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6L23 9l-11-6zM5 13.18l7 3.82 7-3.82V11L12 15 5 11v2.18z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {locale === 'fa' ? 'مرکز معماری ایراک' : 'Iranian Architecture Center'}
            </h1>
            <p className="text-sm opacity-90">
              {locale === 'fa' ? 'مرکز تخصصی آموزش معماری' : 'Specialized Architecture Education Center'}
            </p>
          </div>
        </div>
      </div>

      {/* Email Body */}
      <div className="flex flex-col p-8 bg-white">
        {/* Success Message */}
        <div
          className="flex items-center gap-3 p-4 rounded-lg mb-6"
          style={{ backgroundColor: '#e8f5e8', borderLeft: isRTL ? 'none' : '4px solid #4caf50', borderRight: isRTL ? '4px solid #4caf50' : 'none' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#4caf50' }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#2e7d32' }}>
              {locale === 'fa'
                ? 'ثبت‌نام شما با موفقیت انجام شد!'
                : 'Your enrollment was successful!'}
            </h2>
            <p className="text-sm" style={{ color: '#4caf50' }}>
              {locale === 'fa'
                ? 'به جمع دانشجویان ما خوش آمدید'
                : 'Welcome to our student community'}
            </p>
          </div>
        </div>

        {/* Personal Greeting */}
        <h2 className="text-xl font-bold mb-4">
          {locale === 'fa'
            ? `سلام ${data.userName} عزیز،`
            : `Hello ${data.userName},`}
        </h2>

        <p className="mb-6 leading-relaxed">
          {locale === 'fa'
            ? `شما با موفقیت در دوره "${courseName}" ثبت‌نام شدید. ما خوشحالیم که شما را در این سفر یادگیری همراهی کنیم.`
            : `You have successfully enrolled in the course "${courseName}". We are excited to accompany you on this learning journey.`}
        </p>

        {/* Course Details */}
        <div
          className="flex flex-col p-6 rounded-lg mb-6"
          style={{ backgroundColor: '#F5F7FA' }}
        >
          <h3 className="font-bold mb-4 text-lg" style={{ color: '#168c95' }}>
            {locale === 'fa' ? 'جزئیات دوره:' : 'Course Details:'}
          </h3>

          <div className="flex flex-col gap-3">
            {/* Course Name */}
            <div className="flex justify-between items-start">
              <span className="font-medium" style={{ color: '#4B5563' }}>
                {locale === 'fa' ? 'نام دوره:' : 'Course Name:'}
              </span>
              <span className="font-bold text-right max-w-xs" style={{ color: '#3D3D3D' }}>
                {courseName}
              </span>
            </div>

            {/* Start Date */}
            <div className="flex justify-between items-start">
              <span className="font-medium" style={{ color: '#4B5563' }}>
                {locale === 'fa' ? 'تاریخ شروع:' : 'Start Date:'}
              </span>
              <span className="font-bold" style={{ color: '#3D3D3D' }}>
                {formatDate(data.startDate)}
              </span>
            </div>

            {/* End Date */}
            {data.endDate && (
              <div className="flex justify-between items-start">
                <span className="font-medium" style={{ color: '#4B5563' }}>
                  {locale === 'fa' ? 'تاریخ پایان:' : 'End Date:'}
                </span>
                <span className="font-bold" style={{ color: '#3D3D3D' }}>
                  {formatDate(data.endDate)}
                </span>
              </div>
            )}

            {/* Instructor */}
            {instructor && (
              <div className="flex justify-between items-start">
                <span className="font-medium" style={{ color: '#4B5563' }}>
                  {locale === 'fa' ? 'مدرس:' : 'Instructor:'}
                </span>
                <span className="font-bold" style={{ color: '#3D3D3D' }}>
                  {instructor}
                </span>
              </div>
            )}

            {/* Duration */}
            {data.courseDuration && (
              <div className="flex justify-between items-start">
                <span className="font-medium" style={{ color: '#4B5563' }}>
                  {locale === 'fa' ? 'مدت دوره:' : 'Duration:'}
                </span>
                <span className="font-bold" style={{ color: '#3D3D3D' }}>
                  {data.courseDuration}
                </span>
              </div>
            )}

            {/* Payment Info */}
            {data.amount && (
              <div className="flex justify-between items-start">
                <span className="font-medium" style={{ color: '#4B5563' }}>
                  {locale === 'fa' ? 'مبلغ پرداختی:' : 'Amount Paid:'}
                </span>
                <span className="font-bold" style={{ color: '#2e7d32' }}>
                  {data.amount} {data.currency || (locale === 'fa' ? 'تومان' : 'IRR')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div
          className="flex flex-col p-6 rounded-lg mb-6"
          style={{ backgroundColor: '#fff3cd', border: `1px solid #ffc107` }}
        >
          <h3 className="font-bold mb-3" style={{ color: '#856404' }}>
            {locale === 'fa' ? 'مراحل بعدی:' : 'Next Steps:'}
          </h3>

          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: '#168c95' }}
              >
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <p className="font-medium" style={{ color: '#856404' }}>
                  {locale === 'fa'
                    ? 'به داشبورد کاربری خود مراجعه کنید'
                    : 'Visit your user dashboard'}
                </p>
                <p className="text-sm" style={{ color: '#6c757d' }}>
                  {locale === 'fa'
                    ? 'برای دسترسی به مطالب دوره و اطلاعات بیشتر'
                    : 'To access course materials and additional information'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: '#168c95' }}
              >
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <p className="font-medium" style={{ color: '#856404' }}>
                  {locale === 'fa'
                    ? 'مواد درسی را بررسی کنید'
                    : 'Review the course materials'}
                </p>
                <p className="text-sm" style={{ color: '#6c757d' }}>
                  {locale === 'fa'
                    ? 'فایل‌ها و منابع آموزشی قبل از شروع کلاس'
                    : 'Files and educational resources before class begins'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: '#168c95' }}
              >
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div>
                <p className="font-medium" style={{ color: '#856404' }}>
                  {locale === 'fa'
                    ? 'با سایر دانشجویان ارتباط برقرار کنید'
                    : 'Connect with other students'}
                </p>
                <p className="text-sm" style={{ color: '#6c757d' }}>
                  {locale === 'fa'
                    ? 'از طریق انجمن آنلاین و گروه‌های مطالعه'
                    : 'Through online forums and study groups'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <a
            href={data.dashboardUrl || "/user/dashboard"}
            className="flex items-center justify-center px-8 py-3 rounded-lg font-bold text-white text-center transition-all hover:opacity-90"
            style={{ backgroundColor: '#168c95', textDecoration: 'none' }}
          >
            {locale === 'fa' ? 'مشاهده داشبورد' : 'View Dashboard'}
          </a>

          <a
            href={data.courseUrl || "/courses"}
            className="flex items-center justify-center px-8 py-3 rounded-lg font-bold text-center transition-all hover:bg-opacity-90"
            style={{
              backgroundColor: '#cea87a',
              color: 'white',
              textDecoration: 'none'
            }}
          >
            {locale === 'fa' ? 'مشاهده جزئیات دوره' : 'View Course Details'}
          </a>
        </div>

        {/* Support Section */}
        <div
          className="flex items-start gap-4 p-4 rounded-lg"
          style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#168c95' }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold mb-2" style={{ color: '#3D3D3D' }}>
              {locale === 'fa' ? 'نیاز به راهنمایی دارید؟' : 'Need Help?'}
            </h4>
            <p className="text-sm mb-2" style={{ color: '#6c757d' }}>
              {locale === 'fa'
                ? 'تیم پشتیبانی ما آماده کمک به شماست. با ما در تماس باشید:'
                : 'Our support team is ready to help you. Contact us:'}
            </p>
            <p className="text-sm">
              <strong style={{ color: '#168c95' }}>
                {locale === 'fa' ? 'ایمیل: ' : 'Email: '}
              </strong>
              <a
                href={`mailto:${data.supportEmail || 'support@irac.ir'}`}
                style={{ color: '#168c95', textDecoration: 'none' }}
              >
                {data.supportEmail || 'support@irac.ir'}
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Email Footer */}
      <div
        className="flex flex-col items-center p-6 text-sm"
        style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #dee2e6', color: '#6c757d' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#168c95' }}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6L23 9l-11-6zM5 13.18l7 3.82 7-3.82V11L12 15 5 11v2.18z"/>
            </svg>
          </div>
          <span className="font-bold">
            {locale === 'fa' ? 'مرکز معماری ایراک' : 'Iranian Architecture Center'}
          </span>
        </div>

        <div className="text-center leading-relaxed">
          <p>
            {locale === 'fa'
              ? 'تهران، خیابان فلسطین جنوبی، پلاک ۱۲۳'
              : 'Tehran, South Palestine Street, No. 123'}
          </p>
          <p>
            {locale === 'fa' ? 'تلفن: ' : 'Phone: '}021-66484006 |
            {locale === 'fa' ? ' ایمیل: ' : ' Email: '}
            <a href="mailto:info@irac.ir" style={{ color: '#168c95', textDecoration: 'none' }}>
              info@irac.ir
            </a>
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()}
            {locale === 'fa'
              ? ' مرکز معماری ایراک | تمامی حقوق محفوظ است'
              : ' Iranian Architecture Center | All rights reserved'}
          </p>
        </div>

        {/* Unsubscribe Link */}
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid #dee2e6' }}>
          <p className="text-xs">
            {locale === 'fa'
              ? 'اگر دیگر نمی‌خواهید این ایمیل‌ها را دریافت کنید، '
              : 'If you no longer wish to receive these emails, '}
            <a
              href="/unsubscribe"
              style={{ color: '#6c757d', textDecoration: 'underline' }}
            >
              {locale === 'fa' ? 'لغو اشتراک کنید' : 'unsubscribe here'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

import { sendVerificationCodeSetup } from "./sendVerificationCode/mod.ts";
import { verifyPhoneNumberSetup } from "./verifyPhoneNumber/mod.ts";
import { sendPasswordResetSetup } from "./sendPasswordReset/mod.ts";
import { send2FACodeSetup } from "./send2FACode/mod.ts";
import { sendBookingReminderSetup } from "./sendBookingReminder/mod.ts";
import { sendCertificateNotification } from "./sendCertificateNotification/mod.ts";

export const smsSetup = () => {
  sendVerificationCodeSetup();
  verifyPhoneNumberSetup();
  sendPasswordResetSetup();
  send2FACodeSetup();
  sendBookingReminderSetup();
  sendCertificateNotification();
};

// Export SMS service for use in other modules
export { smsService, SMSService } from "./smsService.ts";

import { sendCertificateEmailNotification } from "./sendCertificateNotification/mod.ts";

export const emailSetup = () => {
  sendCertificateEmailNotification();
};

// Export email service for use in other modules
export { emailService, EmailService } from "./emailService.ts";
export type { EmailConfig, EmailMessage, EmailResponse, CertificateEmailData } from "./emailService.ts";

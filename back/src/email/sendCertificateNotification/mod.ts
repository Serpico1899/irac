import { coreApp } from "../../../mod.ts";
import { sendCertificateEmailNotificationAct } from "./sendCertificateEmailNotification.fn.ts";
import { sendCertificateEmailNotificationValidator } from "./sendCertificateEmailNotification.val.ts";

export const sendCertificateEmailNotification = () => {
  return coreApp.acts.setAct({
    schema: "sendCertificateEmailNotification",
    actName: "sendCertificateEmailNotification",
    validator: sendCertificateEmailNotificationValidator(),
    fn: sendCertificateEmailNotificationAct,
  });
};

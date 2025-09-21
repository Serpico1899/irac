import { coreApp } from "../../../mod.ts";
import { sendCertificateNotificationAct } from "./sendCertificateNotification.fn.ts";
import { sendCertificateNotificationValidator } from "./sendCertificateNotification.val.ts";

export const sendCertificateNotification = () => {
  return coreApp.acts.setAct({
    schema: "sendCertificateNotification",
    actName: "sendCertificateNotification",
    validator: sendCertificateNotificationValidator(),
    fn: sendCertificateNotificationAct,
  });
};

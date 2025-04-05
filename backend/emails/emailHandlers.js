import { brevoClient, sender } from "../lib/brevo.js";
import {
  createWelcomeEmailTemplate,
  createCommentNotificationEmailTemplate,
  createConnectionAcceptedEmailTemplate,
} from "./emailTemplates.js";

export const sendWelcomeEmail = async (email, name, profileUrl) => {
  try {
    await brevoClient.sendTransacEmail({
      sender,
      to: [{ email }],
      subject: "Welcome to LinkedIn",
      htmlContent: createWelcomeEmailTemplate(name, profileUrl),
    });
  } catch (error) {
    console.log(
      "Error in sendWelcomeEmail:",
      error.response?.body || error.message
    );
  }
};

export const sendCommentNotificationEmail = async (
  recipientEmail,
  recipientName,
  commenterName,
  postUrl,
  commentContent
) => {
  try {
    await brevoClient.sendTransacEmail({
      sender,
      to: [{ email: recipientEmail }],
      subject: `${commenterName} commented on your post`,
      htmlContent: createCommentNotificationEmailTemplate(
        recipientName,
        commenterName,
        postUrl,
        commentContent
      ),
    });
  } catch (error) {
    console.log(
      "Error in sendCommentNotificationEmail:",
      error.response?.body || error.message
    );
  }
};

export const sendConnectionAcceptedEmail = async (
  senderName,
  senderEmail,
  recipientName,
  profileUrl
) => {
  try {
    await brevoClient.sendTransacEmail({
      sender,
      to: [{ email: senderEmail }],
      subject: `${recipientName} accepted your connection request`,
      htmlContent: createConnectionAcceptedEmailTemplate(
        senderName,
        recipientName,
        profileUrl
      ),
    });
  } catch (error) {
    console.log(
      "Error in sendConnectionAcceptedEmail:",
      error.response?.body || error.message
    );
  }
};

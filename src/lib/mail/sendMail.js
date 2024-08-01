import AWS from "aws-sdk";
import { TEMP_PASSWORD } from "./templates/TEMP_PASSWORD.js";

const ses = new AWS.SES();

export const sendEmail = async (to, template, templateData) => {
  const templateMap = {
    TEMP_PASSWORD: TEMP_PASSWORD,
  };

  const emailContent = templateMap[template](templateData);
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: emailContent,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Temporary Password : EasyLease",
      },
    },
    Source: "rgyana89@gmail.com",
  };

  try {
    const response = await ses.sendEmail(params).promise();
    console.log("Email sent successfully:", response.MessageId);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

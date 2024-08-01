import AWS from "aws-sdk";

const ses = new AWS.SES();

export const sendEmail = async (to, subject, body) => {
  const data = {
    to,
    subject,
    body,
  };

  try {
    const response = await ses.send(data).promise();
    console.log(response);
  } catch (error) {
    console.error(error);
  }
};

import aws from "aws-sdk";

const uploadS3 = async (file, fileName) => {
  // Configure AWS SDK
  const s3 = new aws.S3();

  // Set up S3 upload parameters
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `images/${fileName}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  // Upload to S3
  try {
    const result = await s3.upload(params).promise();
    return result.Location; // Return the URL of the uploaded image
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

export default uploadS3;
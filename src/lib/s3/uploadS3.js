import aws from "aws-sdk";
import sharp from "sharp";

const uploadS3 = async (file, fileName) => {
  // Configure AWS SDK
  const s3 = new aws.S3();

  // Compress image
  const compressedImage = await sharp(file.buffer)
    .resize({
      width: 1024,
      height: 1024,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 40 })
    .toBuffer();

  // Set up S3 upload parameters
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `images/${fileName}`,
    Body: compressedImage,
    ContentType: "image/jpeg",
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

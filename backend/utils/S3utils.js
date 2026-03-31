import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Generate filename
const generateFileName = (originalName) => {
  const randomName = crypto.randomBytes(16).toString("hex");
  const ext = originalName.split(".").pop();
  return `products/${Date.now()}-${randomName}.${ext}`;
};

// Upload
export const uploadToS3 = async (fileBuffer, fileName) => {
  const key = generateFileName(fileName);

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: `image/${fileName.split(".").pop()}`,
  });

  await s3.send(command);

  const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { imageUrl, imageKey: key };
};

// Delete
export const deleteFromS3 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  });

  await s3.send(command);

  return { success: true };
};
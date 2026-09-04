import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../public/uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Generate unique filename
const generateFileName = (originalName) => {
  const randomName = crypto.randomBytes(16).toString('hex');
  const ext = (originalName || 'jpg').split('.').pop();
  return `${Date.now()}-${randomName}.${ext}`;
};

/**
 * Saves uploaded file locally when AWS S3 is closed or unavailable.
 */
export const uploadToS3 = async (fileBuffer, fileName) => {
  try {
    const uniqueName = generateFileName(fileName);
    const filePath = path.join(uploadsDir, uniqueName);

    // Write file to local public/uploads directory
    await fs.promises.writeFile(filePath, fileBuffer);

    const imageUrl = `/uploads/${uniqueName}`;

    return { imageUrl, imageKey: uniqueName };
  } catch (error) {
    console.error('Error saving image locally:', error);
    throw new Error(`Local file upload failed: ${error.message}`);
  }
};

/**
 * Deletes file from local storage.
 */
export const deleteFromS3 = async (key) => {
  try {
    if (!key) return { success: true };
    const fileName = path.basename(key);
    const filePath = path.join(uploadsDir, fileName);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting local file:', error);
    return { success: false };
  }
};
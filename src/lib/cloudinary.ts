import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

export interface UploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  created_at: string;
}

export async function uploadImage(
  file: File,
  folder = 'blog_images'
): Promise<UploadResult> {
  // Convert file to base64
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

  // Upload to Cloudinary
  try {
    const result = await new Promise<UploadResult>((resolve, reject) => {
      cloudinary.uploader.upload(
        base64String,
        {
          folder,
          resource_type: 'image',
          allowed_formats: ['jpg', 'png', 'gif', 'webp', 'jpeg'],
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result as UploadResult);
        }
      );
    });

    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
}

export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
}

export function getImageUrl(publicId: string, options = {}): string {
  return cloudinary.url(publicId, {
    secure: true,
    ...options
  });
}

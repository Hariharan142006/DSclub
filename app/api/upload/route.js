import { verifyAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export async function POST(request) {
  const authError = verifyAdmin(request);
  if (authError) return authError;
  try {
    const { file, folder } = await request.json(); // file is base64 string

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!file.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // Rough check for 2MB limit (base64 overhead ~33%)
    const base64Data = file.split(',')[1] || file;
    const sizeInBytes = (base64Data.length * 3) / 4;
    if (sizeInBytes > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 2MB limit.' }, { status: 400 });
    }

    const uploadResponse = await cloudinary.uploader.upload(file, {
      folder: folder || 'DS_Club_Uploads',
      resource_type: 'auto', // Auto detects if it's image, video, raw (pdf/docs)
    });

    return NextResponse.json({ url: uploadResponse.secure_url }, { status: 200 });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload to Cloudinary' }, { status: 500 });
  }
}

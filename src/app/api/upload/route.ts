import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

import { put } from '@vercel/blob'; // Import the put function from Vercel Blob

// Helper function to check admin status
async function checkAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.isAdmin) {
    return NextResponse.json({ message: 'Accès non autorisé. Vous devez être administrateur.' }, { status: 403 });
  }
  return null; // Return null if authorized
}

export async function POST(request: Request) {
  const authError = await checkAdminSession();
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'Aucun fichier image fourni.' }, { status: 400 });
    }

    // Basic file type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ message: 'Format d\'image non autorisé. Seuls les fichiers JPG, PNG, GIF, WEBP sont acceptés.' }, { status: 400 });
    }

    // Basic file size validation (e.g., max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: 'La taille de l\'image dépasse la limite (5MB).' }, { status: 400 });
    }

    // Upload the file to Vercel Blob Storage
    // The 'put' function handles the actual upload.
    // 'file.name' is used as the filename in Blob Storage.
    // { access: 'public' } makes the uploaded file publicly accessible via its URL.
    const blob = await put(file.name, file, { access: 'public' });

    // The URL of the uploaded image is available in blob.url
    const imageUrl = blob.url;

    return NextResponse.json({ message: 'Image uploadée avec succès.', imageUrl: imageUrl }, { status: 200 });

  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image (API):', error);
    return NextResponse.json({ message: 'Une erreur interne est survenue lors de l\'upload de l\'image.' }, { status: 500 });
  }
}

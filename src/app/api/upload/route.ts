import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

import { put } from '@vercel/blob'; 

// Helper function to check User session status
async function checkUserSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Accès non autorisé. Vous devez être connecté.' }, { status: 403 });
  }
  return null; 
}

export async function POST(request: Request) {
  const authError = await checkUserSession();
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

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: 'La taille de l\'image dépasse la limite (5MB).' }, { status: 400 });
    }

    const blob = await put(file.name, file, { access: 'public', allowOverwrite:true });

    const imageUrl = blob.url;

    return NextResponse.json({ message: 'Image uploadée avec succès.', imageUrl: imageUrl }, { status: 200 });

  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image (API):', error);
    return NextResponse.json({ message: 'Une erreur interne est survenue lors de l\'upload de l\'image.' }, { status: 500 });
  }
}

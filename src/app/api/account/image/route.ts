import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import { put, del } from '@vercel/blob';
import { updateUserImage, getUserById } from '@/app/lib/data-access/users';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    
    //  Session verification
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    
    try {
        const formData = await request.formData();
        const file = formData.get('image') as File | null;

        if (!file) {
            return NextResponse.json({ message: 'Aucun fichier fourni.' }, { status: 400 });
        }

        // Basic Validation
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ message: 'Format non supporté.' }, { status: 400 });
        }

        // Get old image url before updating
        const currentUser = await getUserById(userId);
        const oldImageUrl = currentUser?.image_url;
        
        // Name file with UserID to avoid sibbling files or conflicts
        const filename = `profiles/${session.user.id}-${Date.now()}.${file.name.split('.').pop()}`;
        const blob = await put(filename, file, { access: 'public' });

        // URL update in data base
        const success = await updateUserImage(userId, blob.url);

        if (!success) {
            await del(blob.url); 
            throw new Error("Erreur lors de la mise à jour en base de données");
        }

        // Clean old image
        if (oldImageUrl) {
            // Check if the old image is stored in Vercel Blob
            if (oldImageUrl.includes('public.blob.vercel-storage.com')) {
                try {
                    await del(oldImageUrl);
                    console.log(`Ancienne image supprimée : ${oldImageUrl}`);
                } catch (deleteError) {
                    // Log the error without blocking the response
                    console.error("Erreur lors de la suppression de l'ancienne image:", deleteError);
                }
            }
        }
        
        return NextResponse.json({ imageUrl: blob.url, message: "Avatar mis à jour" }, { status: 200 });

    } catch (error) {
        console.error('Erreur upload avatar:', error);
        return NextResponse.json({ message: 'Erreur serveur lors de la mise à jour.' }, { status: 500 });
    }
}
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';

import { getAllUsers, deleteUser, updateUserAdminStatus } from '@/app/lib/auth';

// Helper function to check admin status
async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.isAdmin) {
    return { error: NextResponse.json({ message: 'Accès non autorisé. Vous devez être administrateur.' }, { status: 403 }) };
  }
  return { session };
}

export async function GET() {
  const { error, session } = await getAdminSession();
  if (error) return error;
  console.log(`Admin ${session?.user?.email ?? 'inconnu'} a consulté la liste des utilisateurs.`);

  try {
    const users = await getAllUsers();
    return NextResponse.json({ users }, { status: 200 });
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs :', err);
    return NextResponse.json({ message: 'Erreur interne lors du chargement des utilisateurs.' }, { status: 500 });
  }
}

// toggle admin / delete user
export async function POST(request: Request) {
  const { error, session } = await getAdminSession();
  if (error) return error;

  try {
    const { action, userId, isAdmin } = await request.json();
    const currentUserId = Number(session.user.id);
    const targetUserId = Number(userId);

    if (!targetUserId) {
      return NextResponse.json({ message: 'ID utilisateur manquant.' }, { status: 400 });
    }

    if (action === 'toggle_admin_status') {
      if (isAdmin === undefined) {
        return NextResponse.json({ message: 'Statut admin manquant.' }, { status: 400 });
      }

      // Prevent admin from changing their own status
      if (targetUserId === currentUserId && session.user.isAdmin && isAdmin === false) {
        return NextResponse.json({ message: "Vous ne pouvez pas retirer votre propre statut d'administrateur." }, { status: 403 });
      }

      const success = await updateUserAdminStatus(targetUserId, isAdmin, currentUserId);
      return success
        ? NextResponse.json({ message: 'Statut administrateur mis à jour avec succès !' }, { status: 200 })
        : NextResponse.json({ message: 'Erreur lors de la mise à jour du statut administrateur.' }, { status: 500 });

    } else if (action === 'delete_user') {
      // Prevent admin from deleting themselves
      if (targetUserId === currentUserId) {
        return NextResponse.json({ message: "Vous ne pouvez pas supprimer votre propre compte." }, { status: 403 });
      }

      const success = await deleteUser(targetUserId, currentUserId);
      return success
        ? NextResponse.json({ message: 'Utilisateur supprimé avec succès !' }, { status: 200 })
        : NextResponse.json({ message: 'Erreur lors de la suppression de l\'utilisateur.' }, { status: 500 });

    } else {
      return NextResponse.json({ message: 'Action non reconnue.' }, { status: 400 });
    }
  } catch (err) {
    console.error('Erreur lors du traitement de la requête POST :', err);
    return NextResponse.json({ message: 'Erreur interne.' }, { status: 500 });
  }
}
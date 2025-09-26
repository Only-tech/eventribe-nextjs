'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from '@/app/lib/definitions'; // Assuming User type is defined
import { TrashIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react'; // Import useSession for current user ID
import ConfirmationModal from '@/app/ui/ConfirmationModal';

export default function ManageUsersPage() {
  const { data: session } = useSession(); // Get current session
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // State for the confirmation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/users');
        const data = await response.json();
        if (response.ok) {
          setUsers(data.users);
        } else {
          setMessage(data.message || 'Erreur lors du chargement des utilisateurs.');
          setIsSuccess(false);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setMessage('Une erreur est survenue lors du chargement des utilisateurs.');
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Function to open the confirmation modal
  const openConfirmationModal = (msg: string, actionFn: () => void) => {
    setModalMessage(msg);
    setConfirmAction(() => actionFn); // Use a functional update for confirmAction
    setIsModalOpen(true);
  };

  // Function to close the confirmation modal
  const closeConfirmationModal = () => {
    setIsModalOpen(false);
    setModalMessage('');
    setConfirmAction(null);
  };

  const executeToggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    closeConfirmationModal(); // Close the modal first
    setMessage('');
    setIsSuccess(false);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_admin_status', userId, isAdmin: !currentStatus }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setIsSuccess(true);
        // Update the user's status in the local state
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId ? { ...user, is_admin: !currentStatus } : user
          )
        );
      } else {
        setMessage(data.message || 'Erreur lors de la mise à jour du statut.');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut admin:', error);
      setMessage('Une erreur est survenue lors de la mise à jour du statut.');
      setIsSuccess(false);
    }
  };

  const handleToggleAdminStatus = (userId: string, currentStatus: boolean, username: string) => {
    // Prevent admin from changing their own status
  if (session?.user?.id === userId && currentStatus === true) {
    setMessage("Vous ne pouvez pas retirer votre propre statut d'administrateur.");
    setIsSuccess(false);
    return;
  }

    openConfirmationModal(
      `Êtes-vous sûr de vouloir ${currentStatus ? 'retirer le statut admin de' : 'accorder le statut admin à'} ${username} ?`,
      () => executeToggleAdminStatus(userId, currentStatus)
    );
  };

  const executeDeleteUser = async (userId: string) => {
    closeConfirmationModal(); // Close the modal first
    setMessage('');
    setIsSuccess(false);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_user', userId }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setIsSuccess(true);
        // Remove the user from the local state
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      } else {
        setMessage(data.message || 'Erreur lors de la suppression de l\'utilisateur.');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      setMessage('Une erreur est survenue lors de la suppression.');
      setIsSuccess(false);
    }
  };

  const handleDeleteUser = (userId: string, username: string) => {
    // Prevent admin from deleting themselves
    if (session?.user?.id === userId) {
      setMessage("Vous ne pouvez pas supprimer votre propre compte.");
      setIsSuccess(false);
      return;
    }

    openConfirmationModal(
      `Êtes-vous sûr de vouloir supprimer l'utilisateur ${username} ?`,
      () => executeDeleteUser(userId)
    );
  };

  if (loading) {
    return <p className="text-center text-gray-700 text-lg">Chargement des utilisateurs...</p>;
  }

  return (
    <div className="p-3">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Gestion des Utilisateurs</h1>

      {message && (
        <div className={`mb-4 text-center font-semibold rounded-lg p-3  ${isSuccess ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
          {message}
        </div>
      )}

      {users.length === 0 ? (
        <p className="text-center text-gray-700 text-lg">Aucun utilisateur enregistré pour le moment.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-1 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-1 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-1 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-3 hidden min-[870px]:table-cell text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d&apos;inscription</th>
                <th className="px-1 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-1 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                  <td className="px-1 sm:px-6 py-4 sm:whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-1 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleToggleAdminStatus(user.id, user.is_admin, user.username)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                        user.is_admin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      } hover:opacity-80 transition-opacity duration-200`}
                      disabled={session?.user?.id === user.id} // Disable if it's the current user
                    >
                      {user.is_admin ? 'Oui' : 'Non'}
                    </button>
                  </td>
                  <td className="px-6 py-4 hidden min-[870px]:table-cell whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-1 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      className="text-red-600 hover:text-red-900 border-1 rounded-full bg-white hover:bg-amber-50 p-2 md:w-30 shadow-lg  flex items-center justify-center"
                      disabled={session?.user?.id === user.id} // Disable if it's the current user
                    >
                      <TrashIcon className="w-4 h-4" /><span className="hidden md:inline-flex ml-1">Supprimer</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-10 text-center">
        <Link href="/admin" className="h-11 inline-flex items-center justify-center px-5 py-2 rounded-full text-base text-[#FFF] hover:text-gray-800 font-medium transition-colors border-[0.5px] border-transparent shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-gray-800 hover:bg-[#FFF] hover:border-gray-800 cursor-pointer duration-300 ease-in-out">
          Retour au tableau de bord
        </Link>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        message={modalMessage}
        onConfirm={confirmAction || (() => {})} // Ensure confirmAction is not null
        onCancel={closeConfirmationModal}
      />
    </div>
  );
}

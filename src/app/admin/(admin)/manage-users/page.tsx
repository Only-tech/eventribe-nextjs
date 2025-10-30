'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/app/ui/status/ToastProvider';
import { useRouter } from 'next/navigation';
import { User } from '@/app/lib/definitions';
import { ChevronUpIcon, TrashIcon } from '@heroicons/react/16/solid';
import { useSession } from 'next-auth/react';
import ConfirmationModal from '@/app/ui/ConfirmationModal';
import ActionButton from '@/app/ui/buttons/ActionButton';
import IconButton from '@/app/ui/buttons/IconButton';
import Loader from '@/app/ui/animation/Loader'

export default function ManageUsersPage() {

    const router = useRouter();

    const { data: session } = useSession(); 
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const { addToast } = useToast();

    const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            if (response.ok) {
                setUsers(data.users);
            } else {
                addToast(data.message || 'Erreur lors du chargement des utilisateurs.', 'error');
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            addToast('Une erreur est survenue lors du chargement des utilisateurs.', 'error');
        } finally {
            setLoading(false);
        }
        };
        fetchUsers();
    }, []);

    const openConfirmationModal = (msg: string, actionFn: () => void) => {
        setModalMessage(msg);
        setConfirmAction(() => actionFn);
        setIsModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setIsModalOpen(false);
        setModalMessage('');
        setConfirmAction(null);
    };

    const executeToggleAdminStatus = async (userId: number, currentStatus: boolean) => {
        closeConfirmationModal(); 
        addToast('');

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'toggle_admin_status', userId, isAdmin: !currentStatus }),
            });
            const data = await response.json();
            if (response.ok) {
                addToast(data.message);
                setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId ? { ...user, is_admin: !currentStatus } : user
                )
                );
            } else {
                addToast(data.message || 'Erreur lors de la mise à jour du statut.');
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut admin:', error);
            addToast('Une erreur est survenue lors de la mise à jour du statut.', 'error');
        }
    };

    const handleToggleAdminStatus = (userId: number, currentStatus: boolean, username: string) => {
        if (session?.user?.id === String(userId) && currentStatus === true) {
            addToast("Vous ne pouvez pas retirer votre propre statut d'administrateur.");
            return;
        }

        openConfirmationModal(
            `Êtes-vous sûr de vouloir ${currentStatus ? 'retirer le statut admin de' : 'accorder le statut admin à'} ${username} ?`,
            () => executeToggleAdminStatus(userId, currentStatus)
        );
    };

    const executeDeleteUser = async (userId: number) => {
        closeConfirmationModal(); 
        addToast('');
        setDeletingUserId(userId);

        try {
        const response = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete_user', userId }),
        });
        const data = await response.json();
        if (response.ok) {
            addToast(data.message);
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        } else {
            addToast(data.message || 'Erreur lors de la suppression de l\'utilisateur.', 'error');
        }
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'utilisateur:', error);
            addToast('Une erreur est survenue lors de la suppression.', 'error');
        } finally {
        setDeletingUserId(null);
        }
    };

    const handleDeleteUser = (userId: number, first_name: string) => {
        if (session?.user?.id === String(userId)) {
            addToast("Vous ne pouvez pas supprimer votre propre compte.");
            return;
        }

        openConfirmationModal(
            `Êtes-vous sûr de vouloir supprimer l'utilisateur ${first_name} ?`,
            () => executeDeleteUser(userId)
        );
    };

    if (loading) {
        return <>
            <p className="text-center text-gray-700 text-lg mb-4">Chargement des utilisateurs</p>
            <Loader variant="dots" />;
        </>
    }

    return (
        <div className="p-3">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Gestion des Utilisateurs</h1>

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
                                <th className="px-6 py-3 hidden md:table-cell text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d&apos;inscription</th>
                                <th className="px-1 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                <td className="px-1 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</td>
                                <td className="px-1 sm:px-6 py-4 sm:whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-1 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <IconButton
                                        onClick={() => handleToggleAdminStatus(user.id, user.is_admin, user.first_name)}
                                        className={`px-3 py-1 text-xs font-semibold hover:before:[display:none] ${
                                            user.is_admin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        } hover:opacity-80 transition-opacity duration-200`}
                                        disabled={session?.user?.id === String(user.id)}
                                    >
                                        {user.is_admin ? 'Oui' : 'Non'}
                                    </IconButton>
                                </td>
                                <td className="px-6 py-4 hidden md:table-cell whitespace-nowrap text-sm text-gray-500">
                                    {new Date(user.created_at).toLocaleString('fr-FR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </td>
                                <td className="px-1 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <IconButton
                                        onClick={() => handleDeleteUser(user.id, user.first_name)}
                                        className="text-red-600 hover:text-red-900"
                                        isLoading={deletingUserId === user.id}
                                        disabled={session?.user?.id === String(user.id)}
                                        title="Supprimer l'utilisateur"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </IconButton>
                                </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="mt-10 text-center">
                <ActionButton variant="primary" onClick={() => router.push(`/admin/dashboard`)} className="group" >                    
                    <ChevronUpIcon className="inline-block size-6 mr-2 rotate-270 group-hover:animate-bounce" />
                    <span>Tableau de bord</span>
                </ActionButton>
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                message={modalMessage}
                onConfirm={confirmAction || (() => {})}
                onCancel={closeConfirmationModal}
            />
        </div>
    );
}

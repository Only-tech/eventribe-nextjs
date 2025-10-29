'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Event, Participant } from '@/app/lib/definitions';
import { CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '@/app/ui/ConfirmationModal';
import { TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/16/solid';
import IconButton from '@/app/ui/buttons/IconButton';
import ActionButton from '@/app/ui/buttons/ActionButton';
import Loader from '@/app/ui/Loader'

export default function ManageRegistrationsPage() {

    const router = useRouter();

    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
    const [participants, setParticipants] = useState<{ [eventId: number]: Participant[] }>({});
    const [loadingParticipants, setLoadingParticipants] = useState<number | null>(null);

    const [unregisteringInfo, setUnregisteringInfo] = useState<{ userId: number; eventId: number } | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

    // Clean status
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');
            }, 5000); 
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Fetch all events with registration counts on component mount
    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/admin/registrations');
                const data = await response.json();
                if (response.ok) {
                    setEvents(data.events);
                } else {
                    setMessage(data.message || 'Erreur lors du chargement des événements.');
                    setIsSuccess(false);
                }
            } catch (error) {
                console.error('Failed to fetch events for registrations:', error);
                setMessage('Une erreur est survenue lors du chargement des événements.');
                setIsSuccess(false);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const toggleEventExpansion = async (eventId: number) => {
        setMessage('');
        setIsSuccess(false);

        if (expandedEventId === eventId) {
        setExpandedEventId(null); // Collapse if already expanded
        } else {
            setExpandedEventId(eventId);
            // Fetch participants only if they haven't been fetched yet
            if (!participants[eventId]) {
                setLoadingParticipants(eventId);
                try {
                const response = await fetch(`/api/admin/registrations?eventId=${eventId}`);
                const data = await response.json();
                if (response.ok) {
                    setParticipants(prev => ({ ...prev, [eventId]: data.participants }));
                } else {
                    setMessage(data.message || 'Erreur lors du chargement des participants.');
                    setIsSuccess(false);
                }
                } catch (error) {
                console.error('Failed to fetch participants:', error);
                setMessage('Une erreur est survenue lors du chargement des participants.');
                setIsSuccess(false);
                } finally {
                setLoadingParticipants(null);
                }
            }
        }
    };

    // ==== Function to open/close the confirmation modal ====
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

    const executeUnregister = async (userId: number, eventId: number) => {
        closeConfirmationModal();
        setMessage('');
        setIsSuccess(false);
        setUnregisteringInfo({ userId, eventId });

        try {
            const response = await fetch('/api/admin/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'unregister_participant', userId, eventId }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setIsSuccess(true);
                // Update the participants list for the current event
                setParticipants(prev => ({
                ...prev,
                [eventId]: prev[eventId]?.filter(p => p.user_id !== userId) || [],
                }));
                // Also update the registered_count for the event in the events list
                setEvents(prevEvents =>
                prevEvents.map(event =>
                    event.id === eventId
                    ? { ...event, registered_count: Math.max(0, event.registered_count - 1) }
                    : event
                )
                );
            } else {
                setMessage(data.message || 'Erreur lors de la désinscription du participant.');
                setIsSuccess(false);
            }
        } catch (error) {
            console.error('Erreur lors de la désinscription du participant:', error);
            setMessage('Une erreur est survenue lors de la désinscription.');
            setIsSuccess(false);
        } finally {
            setUnregisteringInfo(null); 
        }
    };

    const handleUnregisterParticipant = (userId: number, eventId: number, username: string) => {
        openConfirmationModal(
            `Êtes-vous sûr de vouloir désinscrire ${username} de cet événement ?`,
            () => executeUnregister(userId, eventId)
        );
    };

    if (loading) {
        return <>
        <p className="text-center text-gray-700 text-lg mb-4">Chargement des inscriptions</p>
        <Loader variant="dots" />;
        </>
    }
    
    return (
        <div className="p-3">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-12 text-center">Gestion des Inscriptions</h1>

            {message && (
                <div className={`fixed z-10000 w-full max-w-[85%] top-20 left-1/2 transform -translate-x-1/2 transition-all ease-out py-2 px-4 text-center text-base rounded-lg ${isSuccess ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                {message}
                </div>
            )}

            {events.length === 0 ? (
                <p className="text-center text-gray-700 text-lg">Aucun événement avec des inscriptions à gérer pour le moment.</p>
            ) : (
                <div className="grid grid-cols-1 [@media(min-width:1600px)]:grid-cols-2 gap-10">
                    {events.map((event) => (
                        <div key={event.id} className="max-w-5xl w-full bg-white rounded-lg shadow-lg p-4 md:p-6 mx-auto overflow-hidden" data-aos="fade-up">
                            <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => toggleEventExpansion(event.id)}
                            >
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
                                    <p className="text-gray-700 text-sm mt-1">
                                        <CalendarDaysIcon className="inline-block w-4 h-4 mr-1" />
                                        {new Date(event.event_date).toLocaleString('fr-FR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                        <span className="ml-4">
                                            <MapPinIcon className="inline-block w-4 h-4 mr-1" /> {event.location}
                                        </span>
                                    </p>
                                    <p className="text-gray-700 mt-2">
                                        Inscrits: {event.registered_count} / {event.available_seats}
                                    </p>
                                </div>
                                <IconButton
                                    onClick={() => toggleEventExpansion(event.id)}
                                    aria-expanded={expandedEventId === event.id}
                                    aria-controls={`participants-table-${event.id}`}
                                    title="Voir les participants"
                                >
                                    <ChevronDownIcon className={`w-6 h-6 text-gray-800 transition-transform duration-300 ${expandedEventId === event.id ? 'rotate-180' : ''}`}/>
                                </IconButton>
                            </div>

                            {expandedEventId === event.id && (
                                <div id={`participants-table-${event.id}`} className="mt-6">
                                    {loadingParticipants === event.id ? (
                                        <p className="text-center text-gray-700">Chargement des participants...</p>
                                    ) : participants[event.id]?.length === 0 ? (
                                        <p className="text-center text-gray-700">Aucun participant inscrit pour cet événement.</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 rounded-xl overflow-hidden">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-1 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abonné(e)</th>
                                                        <th className="px-1 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                        <th className="px-6 py-3 text-left text-xs hidden sm:table-cell font-medium text-gray-500 uppercase tracking-wider">Inscrit le</th>
                                                        <th className="px-1 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {participants[event.id]?.map((participant) => (
                                                        <tr key={participant.user_id}>
                                                        <td className="px-1 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{participant.first_name}</td>
                                                        <td className="px-1 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">{participant.email}</td>
                                                        <td className="px-6 py-4 hidden sm:table-cell whitespace-nowrap text-sm text-gray-500">
                                                            {new Date(participant.registered_at).toLocaleString('fr-FR', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td className="px-1 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <ActionButton
                                                                variant="destructive"
                                                                onClick={() => handleUnregisterParticipant(participant.user_id, event.id, participant.first_name)}
                                                                isLoading={unregisteringInfo?.userId === participant.user_id && unregisteringInfo?.eventId === event.id}
                                                                className="max-md:px-2.5 text-sm"
                                                                title="Désinscrire"    
                                                            >                                   
                                                                {!unregisteringInfo && ( <TrashIcon className="w-4 h-4" /> )}
                                                                <span className="hidden md:inline-flex md:ml-2">{unregisteringInfo ? 'Désinscription' : 'Désinscrire'}</span>
                                                            </ActionButton>
                                                        </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
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
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Event } from '@/app/lib/definitions'; // Assuming Event type is defined
import { TrashIcon, CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline'; 
import ConfirmationModal from '@/app/ui/confirmation-modal'; 

// Define a type for participants if not already in definitions.ts
interface Participant {
  user_id: string;
  username: string;
  email: string;
  registered_at: string;
}

export default function ManageRegistrationsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<{ [eventId: string]: Participant[] }>({});
  const [loadingParticipants, setLoadingParticipants] = useState<string | null>(null);

  // State for the confirmation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  // Fetch all events with registration counts on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/registrations'); // GET all events
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

  const toggleEventExpansion = async (eventId: string) => {
    setMessage(''); // Clear messages when expanding/collapsing
    setIsSuccess(false);

    if (expandedEventId === eventId) {
      setExpandedEventId(null); // Collapse if already expanded
      setParticipants(prev => {
        const newParticipants = { ...prev };
        delete newParticipants[eventId]; // Clear participants for collapsed event
        return newParticipants;
      });
    } else {
      setExpandedEventId(eventId);
      setLoadingParticipants(eventId);
      try {
        const response = await fetch(`/api/admin/registrations?eventId=${eventId}`); // GET participants for event
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
  };

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

  // This function will be called when the modal confirms
  const executeUnregister = async (userId: string, eventId: string) => {
    closeConfirmationModal(); // Close the modal first
    setMessage('');
    setIsSuccess(false);

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
          [eventId]: prev[eventId].filter(p => p.user_id !== userId)
        }));
        // Also update the registered_count for the event in the events list
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === eventId ? { ...event, registered_count: event.registered_count - 1 } : event
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
    }
  };

  // Modified handleUnregisterParticipant to open the modal
  const handleUnregisterParticipant = (userId: string, eventId: string, username: string) => {
    openConfirmationModal(
      `Êtes-vous sûr de vouloir désinscrire ${username} de cet événement ?`,
      () => executeUnregister(userId, eventId)
    );
  };

  if (loading) {
    return <p className="text-center text-gray-700 text-lg">Chargement des inscriptions...</p>;
  }

  return (
    <div className="p-3">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-12 text-center">Gestion des Inscriptions</h1>

      {message && (
        <div className={`mb-4 text-center font-semibold p-3 rounded-lg ${isSuccess ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
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
                <button
                  className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                  aria-expanded={expandedEventId === event.id}
                  aria-controls={`participants-table-${event.id}`}
                >
                    <svg className={`w-6 h-6 text-gray-800 transition-transform duration-300 ${expandedEventId === event.id ? 'rotate-180' : ''}`}
                      xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
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
                            <th className="px-1 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="px-1 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs hidden sm:table-cell font-medium text-gray-500 uppercase tracking-wider">Inscrit le</th>
                            <th className="px-1 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {participants[event.id]?.map((participant) => (
                            <tr key={participant.user_id}>
                              <td className="px-1 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{participant.username}</td>
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
                                <button
                                  onClick={() => handleUnregisterParticipant(participant.user_id, event.id, participant.username)}
                                  className="text-red-600 hover:text-red-900 border-1 rounded-full bg-white hover:bg-amber-50 p-2 md:w-30 shadow-lg  flex items-center justify-center"
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
                </div>
              )}
            </div>
          ))}
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

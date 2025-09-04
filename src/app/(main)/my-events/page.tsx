'use client'; // Client Component because it uses useSession

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { normalizeImagePath } from '@/app/lib/utils';
import Image from 'next/image';
import { TrashIcon, CalendarDaysIcon, MapPinIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'; 
import ConfirmationModal from '@/app/ui/confirmation-modal'; 

// Define the type for registered events, extending the base Event type
interface RegisteredEvent {
  id: string;
  title: string;
  event_date: string;
  location: string;
  description_short: string;
  image_url: string | null;
  registered_at: string; // Specific to registered events
  registered_count: number;
}

export default function MyEventsPage() {
  const { data: session, status } = useSession();
  const [myEvents, setMyEvents] = useState<RegisteredEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // State for the confirmation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    // Only fetch data if the user is authenticated
    if (status === 'authenticated' && session?.user?.id) {
      const fetchEvents = async () => {
        try {
          setLoading(true);
          // Call the API route to get registered events
          const response = await fetch(`/api/my-events?userId=${session.user.id}`);
          const data = await response.json();

          if (response.ok) {
            setMyEvents(data.events);
          } else {
            setMessage(data.message || "Erreur lors du chargement de vos inscriptions.");
            setIsSuccess(false);
          }
        } catch (error) {
          console.error("Failed to fetch my events:", error);
          setMessage("Une erreur est survenue lors du chargement de vos inscriptions.");
          setIsSuccess(false);
        } finally {
          setLoading(false);
        }
      };
      fetchEvents();
    } else if (status === 'unauthenticated') {
      setLoading(false);
      // Optionally, redirect to login or show a message
      setMessage("Vous devez être connecté pour voir vos inscriptions.");
      setIsSuccess(false);
    }
  }, [session, status]); // Re-run when session or status changes

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
  const executeUnregister = async (eventId: string) => {
    closeConfirmationModal(); // Close the modal first
    setMessage('');
    setIsSuccess(false);

    try {
      const response = await fetch('/api/unregister-event', { // Create this API route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event_id: eventId, user_id: session?.user?.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsSuccess(true);
        // Refresh the list of events after unregistration
        setMyEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      } else {
        setMessage(data.message || "Erreur lors de la désinscription.");
        setIsSuccess(false);
      }
    } catch (error) {
      console.error("Failed to unregister from event:", error);
      setMessage("Une erreur est survenue lors de la désinscription.");
      setIsSuccess(false);
    }
  };

  // Modified handleUnregister to open the modal
  const handleUnregister = (eventId: string) => {
    openConfirmationModal(
      'Êtes-vous sûr de vouloir annuler votre inscription à cet événement ?',
      () => executeUnregister(eventId)
    );
  };

  if (loading) {
    return <p className="text-center text-gray-700 dark:text-gray-500 text-lg">Chargement de vos inscriptions...</p>;
  }

  return (
    <div className="p-3">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-[#ff952aff] mb-8 text-center">Mes Inscriptions</h1>

      {message && (
        <div className={`mb-4 text-center font-semibold p-3 rounded-lg ${isSuccess ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
          {message}
        </div>
      )}

      {myEvents.length === 0 ? (
        <>
          <p className="text-center text-gray-700 dark:text-gray-500 text-lg">Vous n&apos;êtes inscrit à aucun événement pour le moment.</p>
          <div className="text-center mt-4">
            <Link href="/" className="inline-block px-5 py-2 rounded-full text-base font-medium transition-colors group border-[0.5px] dark:text-zinc-600 shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-[#F0EEE5] hover:bg-[#E8E5D8] hover:border-transparent duration-300 ease-in-out">
              Découvrir des événements&nbsp;
              <ArrowDownIcon className="inline-block w-4 h-4 -translate-y-0.5 group-hover:animate-bounce" />
            </Link>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 [@media(min-width:1600px)]:grid-cols-2 gap-10">
          {myEvents.map((event) => {

            const imageSrc = normalizeImagePath(event.image_url);


            return (
              <div key={event.id} className="flex  items-center max-w-5xl w-full bg-white/95 dark:bg-zinc-900 dark:hover:shadow-[0px_1px_5px_rgba(255,_255,_255,_0.4)] rounded-2xl shadow-lg p-4 mx-auto overflow-hidden group" data-aos="fade-up">
                <div className="hidden md:block relative w-80 h-50 overflow-hidden rounded-lg mr-6">
                  <Image
                    src={imageSrc}
                    alt={`Image de l'événement ${event.title}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="w-full h-50 object-cover group-hover:scale-110 transition duration-500 ease-in-out group-hover:rotate-1"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/600x400.png?text=Image+non+disponible';
                    }}
                  />        
                </div>

                <div className="flex flex-row justify-between items-center max-w-2xl w-full">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-[#ff952aff]">{event.title}</h2>
                    <p className="text-gray-700 dark:text-gray-500 text-sm mt-1">
                        <CalendarDaysIcon className="inline-block w-4 h-4 mr-1" />
                        {new Date(event.event_date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})} GMT+1
                        <span className="ml-4">
                        <MapPinIcon className="inline-block w-4 h-4 mr-1" /> {event.location}
                        </span>
                    </p>
                    <p className="text-gray-700 dark:text-gray-400 mt-2  mb-4 flex-grow">{event.description_short}</p>
                    <p className="text-sm text-gray-500 mb-4">Inscrit le {new Date(event.registered_at).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>

                  <div className="flex flex-col gap-2 border-l-[0.2px] border-gray-300 pl-2 ml-1 sm:ml-3">
                    <button
                      onClick={() => handleUnregister(event.id)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-full cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors"
                      title="Se désinscrire"
                    >
                      <TrashIcon className="w-6 h-6" />
                    </button>

                    <Link href={`/event/${event.id}`}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors flex items-center justify-center"
                    title="En savoir plus"
                    >
                      <svg className="w-6 h-6 text-gray-800 transition-transform duration-300"
                      xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Link href="/events" className="absolute  h-11 inline-flex items-center justify-center mt-10 px-5 py-2 rounded-full text-base text-[#FFF] hover:text-[#ff952aff] font-medium transition-colors group border-[0.5px] border-transparent shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-gray-800 hover:bg-[#FFF] hover:border-[#ff952aff] cursor-pointer duration-300 ease-in-out">
        <ArrowUpIcon className="inline-block w-4 h-4 mr-2 rotate-270 group-hover:animate-bounce" />
        <span>Page d&apos;accueil</span>
      </Link>

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

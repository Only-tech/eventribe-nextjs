'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegisteredEvent } from '@/app/lib/definitions';
import { TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/16/solid';
import { CalendarDaysIcon, MapPinIcon, UsersIcon, } from '@heroicons/react/24/outline'; 
import { normalizeImagePath } from '@/app/lib/utils';
import Image from 'next/image';
import ConfirmationModal from '@/app/ui/ConfirmationModal'; 
import ActionButton from '@/app/ui/buttons/ActionButton';
import IconButton from '@/app/ui/buttons/IconButton';


export default function MyEventsPage() {

  const router = useRouter();

  const { data: session, status } = useSession();
  const [myEvents, setMyEvents] = useState<RegisteredEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
  const [UnregisteringEventId, setUnregisteringEventId] = useState<number | null>(null);

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
      setMessage("Vous devez être connecté pour voir vos inscriptions.");
      setIsSuccess(false);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    }
  }, [session, status, router]); // Re-run when session or status changes

  const toggleEventExpansion = (eventId: number) => {
    setExpandedEventId(prevId => (prevId === eventId ? null : eventId));
  };

  // Function to open/close the confirmation modal
  const openConfirmationModal = (msg: string, actionFn: () => void) => {
    setModalMessage(msg);
    setConfirmAction(() => actionFn); // Use a functional update for confirmAction
    setIsModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsModalOpen(false);
    setModalMessage('');
    setConfirmAction(null);
  };

  // This function will be called when the modal confirms
  const executeUnregister = async (eventId: number) => {
    closeConfirmationModal(); 
    setMessage('');
    setIsSuccess(false);
    setUnregisteringEventId(eventId);

    try {
      const response = await fetch('/api/unregister-event', { 
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
    }finally {
      setUnregisteringEventId(null); 
    }
  };

  const handleUnregister = (eventId: number) => {
    openConfirmationModal(
      'Êtes-vous sûr de vouloir annuler votre inscription à cet événement ?',
      () => executeUnregister(eventId)
    );
  };

  if (loading) {
    return <p className="text-center text-gray-700 dark:text-white/70 text-lg">Chargement de vos inscriptions...</p>;
  }

  return (
    <div className="max-w-[95%] mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-[#ff952aff] mb-8 text-center">Mes Inscriptions</h1>

      {message && (
          <div className={`fixed z-10000 w-full max-w-[85%] top-20 left-1/2 transform -translate-x-1/2 transition-all ease-out py-2 px-4 text-center text-base rounded-lg ${isSuccess ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
              {message}
          </div>
      )}

      {myEvents.length === 0 ? (
        <>
          <p className="text-center text-gray-700 dark:text-white/70 text-lg">Vous n&apos;êtes inscrit à aucun événement pour le moment.</p>
          <div className="text-center mt-4">
            <ActionButton variant="secondary" onClick={() => router.push(`/events`)} >                    
              <span>Découvrir des événements</span>
              <ChevronDownIcon className="inline-block size-6 ml-2 group-hover:animate-bounce" />
            </ActionButton>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 min-[1460px]:grid-cols-[repeat(auto-fit,minmax(696px,1fr))] gap-10">

        {myEvents.map((event) => {
          return (
          <div key={event.id} className="drop-shadow-lg max-w-4xl min-[1460px]:max-w-200 w-full mx-auto transform transition-transform duration-600 hover:drop-shadow-2xl group dark:hover:drop-shadow-[0px_1px_1px_rgba(255,_255,_255,_0.4)] dark:drop-shadow-[0px_1px_3px_rgba(0,0,0,_0.6)] shadow-[hsl(var(--always-black)/5.1%)]" data-aos="fade-up">
            <div className=" w-full bg-white/95 dark:bg-[#1E1E1E] rounded-2xl p-4 overflow-hidden group min-[639px]:[clip-path:var(--clip-path-squircle-60)]" >
              <div className="flex items-center cursor-pointer">
                <div className="hidden sm:block relative w-100 h-50 overflow-hidden rounded-[2.5rem] mr-6" onClick={() => toggleEventExpansion(event.id)}>
                    <Image src={normalizeImagePath(event.image_url)} alt={`Image de l'événement ${event.title}`} fill style={{ objectFit: 'cover' }} className="w-full h-50 object-cover group-hover:scale-110 transition duration-500 ease-in-out group-hover:rotate-1" />        
                </div>
                <div className="flex flex-col sm:flex-row xl:flex-col justify-between items-center max-w-2xl w-full">
                  <div className="max-sm:pl-3" onClick={() => toggleEventExpansion(event.id)}>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-[#ff952aff]">{event.title}</h2>
                    <p className="text-gray-700 dark:text-white/60 text-sm mt-1">
                        <CalendarDaysIcon className="inline-block w-4 h-4 mr-1" />
                        {new Date(event.event_date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                    </p>
                    <p className="text-gray-700 dark:text-white/60 text-sm mt-1"><MapPinIcon className="inline-block w-4 h-4 mr-1" /> {event.location}</p>
                    <p className="text-gray-700 text-center min-[500px]:text-start dark:text-white/70 mt-2  mb-2 flex-grow">{event.description_short}</p>
                    <p className="hidden text-sm text-gray-500 sm:flex xl:hidden justify-between gap-2 whitespace-nowrap">
                      <span className="text-sm inline-flex items-center text-[#08568a] whitespace-nowrap">
                        <UsersIcon className="inline-block size-5 mr-1" /> {event.registered_count}
                      </span>
                      <span className="text-sm">
                        Inscrit le {new Date(event.registered_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span> 
                    </p>
                  </div>
                  <div className="hidden sm:flex xl:hidden flex-col gap-2 border-l-[0.2px] border-gray-300 dark:border-white/20 pl-2 ml-1 sm:ml-3">
                    <IconButton onClick={() => handleUnregister(event.id)} isLoading={UnregisteringEventId === event.id} className="text-red-600 hover:text-red-900" title="Se désinscrire">
                      <TrashIcon className="w-6 h-6" />
                    </IconButton>

                    <IconButton
                      onClick={() => toggleEventExpansion(event.id)}
                      aria-expanded={expandedEventId === event.id}
                      title="En savoir plus"
                    >
                      <ChevronDownIcon className={`w-6 h-6 text-gray-800 transition-transform duration-300 ${expandedEventId === event.id ? 'rotate-180' : ''}`}/>
                    </IconButton>
                  </div>
                  <div className="flex gap-2 items-center justify-between sm:hidden xl:flex w-full">
                    <p className="hidden text-sm text-gray-500  xl:flex justify-between gap-2 whitespace-nowrap">
                      <span className="text-sm inline-flex items-center text-[#08568a] whitespace-nowrap">
                        <UsersIcon className="inline-block size-5 mr-1" /> {event.registered_count}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">Inscrit le {new Date(event.registered_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <div className="flex  gap-2">
                      <IconButton onClick={() => handleUnregister(event.id)} isLoading={UnregisteringEventId === event.id} className="text-red-600 hover:text-red-900" title="Se désinscrire">
                        <TrashIcon className="w-6 h-6" />
                      </IconButton>

                      <IconButton
                        onClick={() => toggleEventExpansion(event.id)}
                        aria-expanded={expandedEventId === event.id}
                        title="En savoir plus"
                      >
                        <ChevronDownIcon className={`w-6 h-6 text-gray-800 transition-transform duration-300 ${expandedEventId === event.id ? 'rotate-180' : ''}`}/>
                      </IconButton>
                    </div>
                  </div>
              </div>
            </div>

            <div className={`w-full transform transition-all ease-in-out duration-700 ${expandedEventId === event.id ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
            {expandedEventId === event.id && (
              <p className="text-gray-700 dark:text-white/85 min-w-full mt-4 p-3 bg-white dark:bg-[#222222] shadow-[0px_0px_2px_rgba(0,0,0,_0.6)] rounded-xl sm:rounded-3xl transition-all ease-in-out duration-700">
                {event.description_long}
              </p>
            )}
            </div>
          </div>
        </div>
      );
    })}
    </div>
      )}

      <ActionButton variant="secondary" onClick={() => router.push(`/events`)} className="mt-10 translate-x-1/2" >                    
        <ChevronUpIcon className="inline-block size-6 mr-2 rotate-270 group-hover:animate-bounce" />
        <span>Page d&apos;accueil</span>
      </ActionButton>

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

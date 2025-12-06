'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegisteredEvent } from '@/app/lib/definitions';
import { TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/16/solid';
import { CalendarDaysIcon, MapPinIcon, UsersIcon, } from '@heroicons/react/24/outline'; 
import { normalizeImagePath } from '@/app/lib/utils';
import { useToast } from '@/app/ui/status/ToastProvider';
import Image from 'next/image';
import ConfirmationModal from '@/app/ui/ConfirmationModal'; 
import ActionButton from '@/app/ui/buttons/ActionButton';
import IconButton from '@/app/ui/buttons/IconButton';
import Loader from '@/app/ui/animation/Loader'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';


export default function MyEventsPage() {

    const router = useRouter();

    const { data: session, status } = useSession();
    const [myEvents, setMyEvents] = useState<RegisteredEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const { addToast } = useToast();
    
    const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
    const [UnregisteringEventId, setUnregisteringEventId] = useState<number | null>(null);

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
                    addToast(data.message || "Erreur lors du chargement de vos inscriptions.");
                }
                } catch (error) {
                    console.error("Failed to fetch my events:", error);
                    addToast("Une erreur est survenue lors du chargement de vos inscriptions.");
                } finally {
                    setLoading(false);
                }
            };
            fetchEvents();
        } else if (status === 'unauthenticated') {
            setLoading(false);
            addToast("Vous devez être connecté pour voir vos inscriptions.");
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

    // This function is called when the modal confirms
    const executeUnregister = async (eventId: number) => {
        closeConfirmationModal(); 
        addToast('');
        setUnregisteringEventId(eventId);

        try {
            const response = await fetch('/api/unregister-event', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event_id: eventId, user_id: session?.user?.id }),
            });

            const data = await response.json();

            if (response.ok) {
                addToast(data.message);
                // Refresh the list of events after unregistration
                setMyEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
            } else {
                addToast(data.message || "Erreur lors de la désinscription.");
            }
        } catch (error) {
            console.error("Failed to unregister from event:", error);
            addToast("Une erreur est survenue lors de la désinscription.");
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
        return <>
            <p className="text-center text-gray-700 dark:text-white/70 text-lg mb-4">Chargement de vos inscriptions</p>
            <Loader variant="dots" />;
        </>
    }

    return (
        <div className="max-w-[95%] mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-[#ff952aff] mb-8 text-center">Mes Inscriptions</h1>

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
                        const isExpanded = expandedEventId === event.id;

                        return (
                            <div key={event.id} className=" max-w-4xl w-full min-[1460px]:max-w-200 mx-auto group drop-shadow-lg hover:drop-shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:drop-shadow-[0_10px_12px_rgb(0,0,0,0.5)] dark:hover:drop-shadow-[0_12px_15px_rgb(0,0,0,0.8)] shadow-[hsl(var(--always-black)/5.1%)]">
                                <div className=" w-full sm:bg-gray-300 dark:sm:bg-white/10 sm:p-[0.5px] min-[639px]:[clip-path:var(--clip-path-squircle-60)]"  data-aos="fade-up">
                                    
                                    {/* =========== Main Container ============ */}
                                    <div className="relative overflow-hidden w-full bg-white/95 dark:bg-[#1E1E1E] rounded-xl max-sm:border border-gray-300 dark:border-white/10 min-[639px]:[clip-path:var(--clip-path-squircle-60)]" >
                                        
                                        {/* Image and details content*/}
                                        <div className={`p-2 flex items-center cursor-pointer sm:p-4 transition-all duration-700 ease-in-out ${isExpanded ? '-translate-y-24 opacity-40 blur-[1px]' : 'translate-y-0 opacity-100'}`}>
                                            <div className="hidden sm:block relative w-100 h-50 overflow-hidden rounded-[2.5rem] mr-6" onClick={() => toggleEventExpansion(event.id)}>
                                                <Image src={normalizeImagePath(event.image_url)} alt={`Image de l'événement ${event.title}`} fill style={{ objectFit: 'cover' }} className="w-full h-50 object-cover group-hover:scale-110 transition duration-500 ease-in-out group-hover:rotate-1" />        
                                            </div>
                                            <div className="flex items-start flex-col sm:flex-row xl:flex-col sm:items-center xl:items-start justify-between max-w-2xl w-full">
                                                <section className="max-sm:pl-3 flex-1" onClick={() => toggleEventExpansion(event.id)}>
                                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-[#ff952aff]">{event.title}</h2>
                                                    <p className="text-gray-700 dark:text-white/60 text-sm mt-1">
                                                        <CalendarDaysIcon className="inline-block w-4 h-4 mr-1" />
                                                        {new Date(event.event_date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                                                    </p>
                                                    <p className="text-gray-700 dark:text-white/60 text-sm mt-1"><MapPinIcon className="inline-block w-4 h-4 mr-1" /> {event.location}</p>
                                                    <p className="text-gray-700 text-justify min-[500px]:text-start dark:text-white/70 mt-2  mb-2 grow">{event.description_short}</p>
                                                    
                                                    <p className="hidden text-sm text-gray-500 sm:flex xl:hidden justify-between gap-2 whitespace-nowrap">
                                                        <span className="text-sm inline-flex items-center text-[#08568a] whitespace-nowrap">
                                                            <UsersIcon className="inline-block size-5 mr-1" /> {event.registered_count}
                                                        </span>
                                                        <span className="text-sm">
                                                            Inscrit le {new Date(event.registered_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span> 
                                                    </p>
                                                </section>

                                                {/* Buttons bar right side */}
                                                <div className="hidden sm:flex xl:hidden flex-col gap-2 border-l-[0.2px] border-gray-300 dark:border-white/20 pl-2 ml-1 sm:ml-3">
                                                    <IconButton onClick={() => handleUnregister(event.id)} isLoading={UnregisteringEventId === event.id} className="text-red-600 hover:text-red-900" title="Se désinscrire">
                                                        <TrashIcon className="w-6 h-6" />
                                                    </IconButton>
                                                    <IconButton onClick={() => toggleEventExpansion(event.id)} aria-expanded={isExpanded} title="En savoir plus">
                                                        <ChevronUpIcon className="w-6 h-6 text-gray-800"/>
                                                    </IconButton>
                                                </div>

                                                <div className="flex gap-2 items-center justify-between sm:hidden xl:flex w-full">
                                                    <p className="hidden text-sm text-gray-500  xl:flex justify-between gap-2 whitespace-nowrap">
                                                        <span className="text-sm inline-flex items-center text-[#08568a] whitespace-nowrap">
                                                            <UsersIcon className="inline-block size-5 mr-1" /> {event.registered_count}
                                                        </span>
                                                    </p>
                                                    <p className="text-sm text-gray-500">Inscrit le {new Date(event.registered_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                    
                                                    {/* Buttons bar bottom side */}
                                                    <div className="flex  gap-2">
                                                        <IconButton onClick={() => handleUnregister(event.id)} isLoading={UnregisteringEventId === event.id} className="text-red-600 hover:text-red-900" title="Se désinscrire">
                                                            <TrashIcon className="w-6 h-6" />
                                                        </IconButton>
                                                        <IconButton onClick={() => toggleEventExpansion(event.id)} aria-expanded={isExpanded} title="En savoir plus">
                                                            <ChevronUpIcon className="w-6 h-6 text-gray-800"/>
                                                        </IconButton>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ======== Overlay Long Description =============== */}
                                        <div className={`absolute bottom-0 inset-x-0 z-20 flex flex-col justify-center w-full bg-white/95 dark:bg-[#222222]/95 backdrop-blur-md border-t border-gray-200 dark:border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] rounded-t-3xl pt-3 pl-6 pb-4 pr-1 transition-transform duration-700 ease-in-out ${isExpanded ? 'translate-y-0' : 'translate-y-full'}`}>
                                            {/* Close bar button */}
                                            <button 
                                                onClick={() => toggleEventExpansion(event.id)}
                                                className=" w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full cursor-pointer hover:bg-[#08568a] transition-colors mx-auto my-1"
                                                title="Fermer"
                                            />
                                            
                                            <OverlayScrollbarsComponent className="mt-2 h-32 cookie">
                                                <p className="text-gray-800 dark:text-white/90 text-base text-justify leading-relaxed mr-6">
                                                    {event.description_long}
                                                </p>
                                            </OverlayScrollbarsComponent>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ConfirmationModal
                isOpen={isModalOpen}
                message={modalMessage}
                onConfirm={confirmAction || (() => {})} 
                onCancel={closeConfirmationModal}
            />
        </div>
    );
}
'use client';

import type { Session } from 'next-auth';
import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDaysIcon, MapPinIcon, FingerPrintIcon, InformationCircleIcon } from '@heroicons/react/24/outline'; 
import { PencilIcon } from '@heroicons/react/24/solid'; 
import { TrashIcon, PlusIcon, ChevronUpIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/16/solid';
import Image from 'next/image';
import { normalizeImagePath } from '@/app/lib/utils';
import { Event, Participant } from '@/app/lib/definitions'; 
import ConfirmationModal from '@/app/ui/ConfirmationModal'; 
import FloatingLabelInput from '@/app/ui/FloatingLabelInput';
import ActionButton from '@/app/ui/buttons/ActionButton';
import IconButton from '@/app/ui/buttons/IconButton';


export default function UserAccountManageEventsPage() {

    const router = useRouter();

    const [session, setSession] = useState<Session | null>(null);
    const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    const [isAccountUpdating, setIsAccountUpdating] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [action, setAction] = useState<'list' | 'create' | 'edit'>('list');
    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
    const [isEditingInfo, setIsEditingInfo] = useState(false);

    const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
    const [participants, setParticipants] = useState<{ [eventId: number]: Participant[] }>({});
    const [loadingParticipants, setLoadingParticipants] = useState<number | null>(null);

    const [title, setTitle] = useState('');
    const [descriptionShort, setDescriptionShort] = useState('');
    const [descriptionLong, setDescriptionLong] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [location, setLocation] = useState('');
    const [availableSeats, setAvailableSeats] = useState<number | ''>('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
    const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
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

    // Fetch session on loading
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await fetch('/api/auth/session');
                if (res.ok) {
                    const data = await res.json();
                    if (data && Object.keys(data).length > 0) {
                        setSession(data);
                        setAuthStatus('authenticated');
                    } else {
                        setSession(null);
                        setAuthStatus('unauthenticated');
                    }
                } else {
                    setAuthStatus('unauthenticated');
                }
            } catch (error) {
                console.error('Failed to fetch session:', error);
                setAuthStatus('unauthenticated');
            }
        };
        fetchSession();
    }, []);

    // Authentication status
    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            window.location.href = '/login';
        }  
        
        if (authStatus === 'authenticated' && session?.user) {
            setFirstName(session.user.firstName ?? '');
            setLastName(session.user.lastName ?? '');
            setEmail(session.user.email ?? '');
            fetchUserEvents();
        }
    }, [authStatus, session]);

    // ==== Update Account =====
    const handleUpdateAccount = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage('');
        setIsAccountUpdating(true);

        try {
            const response = await fetch('/api/account/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email }),
            });
            const data = await response.json();

            if (response.ok) {
                setMessage('Informations de compte mises à jour avec succès.');
                setIsSuccess(true);
                router.refresh();
                setIsEditingInfo(false);
            } else {
                setMessage(data.message || 'Échec de la mise à jour des informations.');
                setIsSuccess(false);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du compte:', error);
            setMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
            setIsSuccess(false);
        } finally {
            setIsAccountUpdating(false);
        }
    };

    // ===== Fetch User Events =====
    const fetchUserEvents = async () => {
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch('/api/account/events');
            const data = await res.json();
            if (res.ok) {
                setEvents(data);
            } else {
                setMessage(data.message || 'Erreur lors du chargement des événements.');
                setEvents([]);
                setIsSuccess(false);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des événements", error);
            setMessage('Une erreur est survenue lors du chargement des événements.');
            setEvents([]);
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    };


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
                const response = await fetch(`/api/account/registrations?eventId=${eventId}`);
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

    // ===== Upload Image, Create, update Event ======
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        } else {
            setImageFile(null);
            setPreviewImage(imageUrl); 
        }
    };
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsSuccess(false);
        setIsSubmittingEvent(true); 

        let finalImageUrl = imageUrl;

        if (imageFile) {
            setUploadingImage(true);
            try {
                const formData = new FormData();
                formData.append('image', imageFile);
                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                const uploadData = await uploadResponse.json();
                if (uploadResponse.ok) {
                    finalImageUrl = uploadData.imageUrl;
                } else {
                    setMessage(uploadData.message || 'Erreur lors de l\'upload de l\'image.');
                    setIsSuccess(false);
                    setUploadingImage(false);
                    setIsSubmittingEvent(false); 
                    return;
                }
            } catch (uploadError) {
                console.error('Erreur lors de l\'upload de l\'image:', uploadError);
                setMessage('Une erreur est survenue lors de l\'upload de l\'image.');
                setIsSuccess(false);
                setUploadingImage(false);
                setIsSubmittingEvent(false); 
                return;
            } finally {
                setUploadingImage(false);
            }
        }

        const method = action === 'create' ? 'POST' : 'PUT';
        const url = '/api/account/events';
        const eventData = {
            title,
            description_short: descriptionShort,
            description_long: descriptionLong,
            event_date: eventDate,
            location,
            available_seats: Number(availableSeats),
            image_url: finalImageUrl,
            ...(action === 'edit' && { id: currentEvent?.id }),
        };
        
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(data.message);
                setIsSuccess(true);
                fetchUserEvents();
                setTimeout(() => setAction('list'), 2000);
            } else {
                setMessage(data.message || `Échec de ${action === 'create' ? 'la création' : 'la mise à jour'}.`);
                setIsSuccess(false);
            }
        } catch (error) {
            console.error(`Erreur lors de ${action === 'create' ? 'la création' : 'la mise à jour'}`, error);
            setMessage(`Une erreur est survenue lors de ${action === 'create' ? 'la création' : 'la mise à jour'}.`);
            setIsSuccess(false);
        } finally {
            setIsSubmittingEvent(false); 
        }
    };

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
            const response = await fetch('/api/account/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'unregister_participant', userId, eventId }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setIsSuccess(true);
                setParticipants(prev => ({
                    ...prev,
                    [eventId]: prev[eventId].filter(p => p.user_id !== userId)
                }));
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
        } finally {
            setUnregisteringInfo(null); 
        }
    };

    const handleUnregisterParticipant = (userId: number, eventId: number, firstName: string) => {
        openConfirmationModal(
            `Êtes-vous sûr de vouloir désinscrire ${firstName} de cet événement ?`,
            () => executeUnregister(userId, eventId)
        );
    };
    
    const executeDelete = async (eventId: number) => {
        closeConfirmationModal(); 
        setMessage('');
        setIsSuccess(false);
        setDeletingEventId(eventId); 

        try {
            const response = await fetch('/api/account/events', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId: eventId }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setIsSuccess(true);
                setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
            } else {
                setMessage(data.message || 'Erreur lors de la suppression de l\'événement.');
                setIsSuccess(false);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'événement:', error);
            setMessage('Une erreur est survenue lors de la suppression.');
            setIsSuccess(false);
        } finally {
            setDeletingEventId(null);
        }
    };

    const handleDelete = (eventId: number) => {
        openConfirmationModal(
            'Êtes-vous sûr de vouloir supprimer cet événement ? \n\n Toutes les inscriptions associées seront également supprimées.',
            () => executeDelete(eventId)
        );
    };

    const handleEditClick = (event: Event) => {
        setCurrentEvent(event);
        setTitle(event.title);
        setDescriptionShort(event.description_short);
        setDescriptionLong(event.description_long);
        
        const date = new Date(event.event_date);
        const formattedDate = date.toISOString().slice(0, 16);
        setEventDate(formattedDate);
        setLocation(event.location);
        setAvailableSeats(event.available_seats);
        setImageUrl(event.image_url);
        setPreviewImage(event.image_url);
        setAction('edit');
    };

    const renderForm = () => (
        <form onSubmit={handleSubmit} className="max-w-5xl p-6 md:px-8 md:py-10 xl:py-12 rounded-4xl mx-auto bg-[#FCFFF7] dark:bg-[#1E1E1E] dark:text-white/85 sm:mb-15 transition-all drop-shadow-2xl hover:drop-shadow-xl group dark:hover:drop-shadow-[0px_1px_1px_rgba(255,_255,_255,_0.4)] dark:drop-shadow-[0px_15px_15px_rgba(0,0,0,_0.6)] shadow-[hsl(var(--always-black)/5.1%)]">
            <h2 className="text-3xl font-bold mb-6 sm:mb-10 text-gray-800 dark:text-[#ff952aff] text-center">{action === 'create' ? 'Créer un événement' : 'Modifier l\'événement'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
                <div className="relative">
                    <label htmlFor="title" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 dark:text-white/70 px-1 py-0 ml-4 bg-[#FCFFF7] dark:bg-[#1E1E1E]">Évènement</label>
                    <input type="text" id="title" name="title" value={title ?? ''} onChange={(e) => setTitle(e.target.value)} required className="block w-full px-3 pb-2 pt-3 border border-gray-300 dark:border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0088aa] hover:border-[#0088aa] focus:border-[#0088aa] dark:focus:ring-[#ff952aff] dark:hover:border-[#ff952aff] dark:focus:border-[#ff952aff]" />
                </div>
                <div className="relative">
                    <label htmlFor="eventDate" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 dark:text-white/70 px-1 py-0 ml-4 bg-[#FCFFF7] dark:bg-[#1E1E1E]">Date et heure</label>
                    <input type="datetime-local" id="eventDate" name="event_date" value={eventDate ?? ''} onChange={(e) => setEventDate(e.target.value)} required className="block w-full px-3 pb-2 pt-3 border border-gray-300 dark:border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0088aa] hover:border-[#0088aa] focus:border-[#0088aa] dark:focus:ring-[#ff952aff] dark:hover:border-[#ff952aff] dark:focus:border-[#ff952aff]" />
                </div>
                <div className="relative">
                    <label htmlFor="location" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 dark:text-white/70 px-1 py-0 ml-4 bg-[#FCFFF7] dark:bg-[#1E1E1E]">Lieu</label>
                    <input type="text" id="location" value={location ?? ''} onChange={(e) => setLocation(e.target.value)} required className="block w-full px-3 pb-2 pt-3 border border-gray-300 dark:border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0088aa] hover:border-[#0088aa] focus:border-[#0088aa] dark:focus:ring-[#ff952aff] dark:hover:border-[#ff952aff] dark:focus:border-[#ff952aff]" />
                </div>
                <div className="relative">
                    <label htmlFor="availableSeats" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 dark:text-white/70 px-1 py-0 ml-4 bg-[#FCFFF7] dark:bg-[#1E1E1E]">Places disponibles</label>
                    <input type="number" id="availableSeats" value={availableSeats ?? ''} onChange={(e) => setAvailableSeats(Number(e.target.value))} required min="0" className="block w-full px-3 pb-2 pt-3 border border-gray-300 dark:border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0088aa] hover:border-[#0088aa] focus:border-[#0088aa] dark:focus:ring-[#ff952aff] dark:hover:border-[#ff952aff] dark:focus:border-[#ff952aff]" />
                </div>
                <div className="relative md:col-span-2">
                    <label htmlFor="descriptionShort" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 dark:text-white/70 px-1 py-0 ml-4 bg-[#FCFFF7] dark:bg-[#1E1E1E]">Description courte</label>
                    <textarea id="descriptionShort" name="description_short" value={descriptionShort ?? ''} onChange={(e) => setDescriptionShort(e.target.value)} required className="block w-full px-3 pb-2 pt-3 border border-gray-300 dark:border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0088aa] hover:border-[#0088aa] focus:border-[#0088aa] dark:focus:ring-[#ff952aff] dark:hover:border-[#ff952aff] dark:focus:border-[#ff952aff]" rows={2}></textarea>
                </div>
                <div className="relative md:col-span-2">
                    <label htmlFor="descriptionLong" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 dark:text-white/70 px-1 py-0 ml-4 bg-[#FCFFF7] dark:bg-[#1E1E1E]">Description longue</label>
                    <textarea id="descriptionLong" name="description_long" value={descriptionLong ?? ''} onChange={(e) => setDescriptionLong(e.target.value)} required className="block w-full px-3 pb-2 pt-3 border border-gray-300 dark:border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0088aa] hover:border-[#0088aa] focus:border-[#0088aa] dark:focus:ring-[#ff952aff] dark:hover:border-[#ff952aff] dark:focus:border-[#ff952aff]" rows={4}></textarea>
                </div>
                <div className="relative ">
                    <label htmlFor="image" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 dark:text-white/70 px-1 py-0 ml-4 bg-[#FCFFF7] dark:bg-[#1E1E1E]">Image de l&apos;événement</label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        className="mt-1 block w-full text-sm text-gray-500 rounded-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#e2e4e0] file:text-gray-700 dark:text-white/70 hover:file:bg-[#E8E5D8] px-3 pb-2 pt-3 border border-gray-300 dark:border-white/20 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0088aa] hover:border-[#0088aa] focus:border-[#0088aa] dark:focus:ring-[#ff952aff] dark:hover:border-[#ff952aff] dark:focus:border-[#ff952aff]"
                        onChange={handleImageChange}
                        disabled={uploadingImage || isSubmittingEvent}
                    />
                    {(previewImage || imageUrl) && (
                        <div className="mt-4 flex justify-center sm:absolute bg-[#FCFFF7] dark:bg-[#1E1E1E] dark:text-white rounded-xl px-2 pb-2">
                            <Image
                                src={previewImage || normalizeImagePath(imageUrl)}
                                alt="Aperçu de l'image"
                                width="200"
                                height="150"
                                style={{ objectFit: 'cover', height: '150px' }}
                                className="rounded-md shadow-sm"
                            />
                        </div>
                    )}
                    {uploadingImage && (
                        <p className="text-center text-sm text-gray-500 mt-2">Chargement de l&apos;image...</p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-end gap-4 mt-4 md:col-start-2">
                    <ActionButton
                        type="button"
                        variant="destructive"
                        onClick={() => {
                            setAction('list');
                            setMessage('');
                        }}
                        className="min-w-32"
                    >
                        <ChevronUpIcon className="inline-block size-6 mr-2 rotate-270 group-hover:animate-bounce" /> 
                        <span>Annuler</span>
                    </ActionButton>
                    <ActionButton
                        type="submit"
                        variant="primary"
                        isLoading={isSubmittingEvent}
                        className="min-w-32"
                    >
                        {isSubmittingEvent ? (
                            <span className="ml-3">
                                {action === 'create' ? 'Création' : 'Mise à jour'}
                            </span>
                        ) : (
                            <>
                                <PlusIcon className="inline-block size-5 mr-2 group-hover:animate-bounce" />
                                <span>
                                    {action === 'create' ? 'Créer' : 'Mettre à jour'}
                                </span>
                            </>
                        )}
                    </ActionButton>
                </div>
            </div>
        </form>
    );

    const renderList = () => (
        <>
            <div className="relative mt-6 mb-12 max-w-3xl drop-shadow-lg mx-auto transition-all duration-300 ease-in-out hover:drop-shadow-2xl group dark:hover:drop-shadow-[0px_1px_1px_rgba(255,_255,_255,_0.4)] dark:drop-shadow-[0px_1px_3px_rgba(0,0,0,_0.6)] shadow-[hsl(var(--always-black)/5.1%)]">
                {!isEditingInfo ? (
                     <div
                        onClick={() => setIsEditingInfo(true)}
                        className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 items-center gap-6 px-6 pt-6 sm:pt-1 rounded-2xl text-base font-medium group dark:text-zinc-600  bg-[#FCFFF7] dark:bg-[#161616] hover:bg-[#E8E5D8] hover:dark:bg-[#1E1E1E] group-hover:dark:bg-[#1E1E1E] group-hover:bg-[#E8E5D8] transition-all duration-300 ease-in-out">
                        
                        <h2 className="absolute z-10 px-3 py-2 rounded-3xl text-2xl sm:text-3xl right-0 top-0 -translate-y-1/2 font-extrabold text-gray-900 dark:text-white/70 mr-6 sm:mr-12 bg-[#FCFFF7] dark:bg-[#161616] group-hover:bg-[#E8E5D8] group-hover:dark:bg-[#1E1E1E] group transition-all duration-300 ease-in-out">
                            Mon Compte
                        </h2>
                        <h3 className="md:col-span-2 text-xl dark:text-white/45 font-bold mb-3">Mes identifiants</h3>
                        <div className="relative">
                            <p className="absolute right-0 top-0 -translate-y-1/2 text-gray-500 dark:text-white/45  px-1 py-0 mr-6 bg-[#FCFFF7] dark:bg-[#161616] group-hover:bg-[#E8E5D8] group-hover:dark:bg-[#1E1E1E] transition-colors duration-300">Prénom</p>
                            {session && (<p className="block w-full h-12 px-3 pb-2 pt-3 border border-gray-300 dark:border-white/20 text-lg text-start rounded-md shadow-sm"> {session.user.firstName} </p>)}
                        </div>
                        <div className="relative">
                            <p className="absolute right-0 top-0 -translate-y-1/2 text-gray-500 dark:text-white/45 px-1 py-0 mr-6 bg-[#FCFFF7] dark:bg-[#161616] group-hover:bg-[#E8E5D8] group-hover:dark:bg-[#1E1E1E] transition-colors duration-300">Nom</p>
                            {session && (<p className="block w-full h-12 px-3 pb-2 pt-3 border border-gray-300 dark:border-white/20 text-lg text-start rounded-md shadow-sm"> {session.user.lastName} </p>)}
                        </div>
                        <div className="relative md:col-span-2">
                            <p className="absolute right-0 top-0 -translate-y-1/2 text-gray-500 dark:text-white/45 px-1 py-0 mr-6 bg-[#FCFFF7] dark:bg-[#161616] group-hover:bg-[#E8E5D8] group-hover:dark:bg-[#1E1E1E] transition-colors duration-300">Adresse e-mail</p>
                            {session && (<p className="block w-full h-12 px-3 pb-2 pt-3 border border-gray-300 dark:border-white/20 text-lg text-start rounded-md shadow-sm"> {session.user.email} </p>)}
                        </div>
                        <div className="md:col-span-2 h-full mx-auto w-full max-w-[90%] border-t-[0.2px] group-hover:border-gray-400"></div>
                        <p className="group-hover:bg-black/15 bg-black/10 rounded-full p-2 md:col-span-2 text-center dark:text-white/45 transition-colors duration-300"><FingerPrintIcon className="inline-block w-4 h-4 mr-1 group-hover:animate-bounce" />Modifier mes identifiants</p>
                        <div className="relative md:col-span-2 w-full">
                        <div className="absolute bottom-0 w-full overflow-hidden whitespace-nowrap">
                            {session && (
                            <p className="animate-banner inline-flex items-center text-center text-sm text-gray-500 dark:text-white/65 w-full">
                                <InformationCircleIcon className="w-5 h-5 inline-block mr-2"/>
                                <span>Bonjour {session.user.firstName} ! Gérez vos informations personnelles et vos événements !</span>
                            </p>
                            )}
                        </div>
                        </div>

                    </div>
                ) : (
                    <div className="relative z-1 max-w-md mx-auto transition-all ease-in-out duration-300 bg-[#FCFFF7] dark:bg-[#1E1E1E] dark:text-white/70 rounded-2xl p-4 sm:p-8 min-[639px]:[clip-path:var(--clip-path-squircle-60)]" >
                        <IconButton
                            type="button"
                            onClick={() => setIsEditingInfo(false)}
                            className="absolute z-0 top-3 right-3 text-gray-500 hover:text-[#0088aa] dark:hover:text-[#ff952aff] text-2xl font-bold bg-transparent hover:bg-gray-200"
                            aria-label="Quitter"
                            title="Quitter"
                        >
                            <XMarkIcon className="size-6"/>
                        </IconButton>
                        <h3 className="flex flex-col items-center justify-center text-xl min-[400px]:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white/70 mb-8">
                            <FingerPrintIcon className="w-auto h-14  mb-4" />
                            <span>Modifier mes identifiants</span>
                        </h3>
                        <form className="space-y-6" onSubmit={handleUpdateAccount}>
                            <FloatingLabelInput id="firstName" label="Prénom" type="text" value={firstName ?? ''} onChange={(e) => setFirstName(e.target.value)} required />
                            <FloatingLabelInput id="lastName" label="Nom" type="text" value={lastName ?? ''} onChange={(e) => setLastName(e.target.value)} required />
                            <FloatingLabelInput id="email" label="Adresse email" type="email" value={email ?? ''} onChange={(e) => setEmail(e.target.value)} required />
                            
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                                <ActionButton type="button" variant="destructive" onClick={() => setIsEditingInfo(false)} className="flex-1">
                                    <ChevronUpIcon className="inline-block size-6 mr-2 rotate-270 group-hover:animate-bounce" /> 
                                    <span>Annuler</span>
                                </ActionButton>
                                <ActionButton type="submit" variant="primary" isLoading={isAccountUpdating} className="flex-1">
                                    {isAccountUpdating ? 'Mise à jour' : 'Enregistrer'}
                                    {!isAccountUpdating && ( <ChevronUpIcon className="inline-block size-6 ml-2 rotate-90 group-hover:animate-bounce" /> )}
                                </ActionButton>
                            </div>
                        </form>
                    </div>
                )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-evenly gap-5 items-center mb-6 mt-8">
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-[#ff952aff]">Mes événements</h2>
                <ActionButton
                    onClick={() => {
                        setAction('create');
                        setCurrentEvent(null);
                        setTitle('');
                        setDescriptionShort('');
                        setDescriptionLong('');
                        setEventDate('');
                        setLocation('');
                        setAvailableSeats('');
                        setImageUrl(null);
                        setPreviewImage(null);
                        setImageFile(null);
                        setMessage('');
                    }}
                >
                    <PlusIcon className="inline-block size-5 mr-2 group-hover:animate-bounce" />
                    <span>Créer un événement</span>
                </ActionButton>
            </div>

            {loading ? (
                <p className="text-center text-xl text-gray-700 dark:text-gray-300">Chargement des événements...</p>
            ) : events.length === 0 ? (
                <p className="text-center text-gray-700 dark:text-gray-300 text-lg">
                    Vous n&apos;avez pas encore créé d&apos;événements.
                </p>
            ) : (
                <div className="grid grid-cols-1 min-[1460px]:grid-cols-[repeat(auto-fit,minmax(696px,1fr))] gap-10">
                {events.map((event) => (
                    <div key={event.id} className="drop-shadow-lg max-w-4xl w-full mx-auto transform transition-transform duration-300 hover:drop-shadow-2xl group dark:hover:drop-shadow-[0px_1px_1px_rgba(255,_255,_255,_0.4)] dark:drop-shadow-[0px_1px_3px_rgba(0,0,0,_0.6)] shadow-[hsl(var(--always-black)/5.1%)]" data-aos="fade-up">
                        <div className=" w-full bg-white/95 dark:bg-[#1E1E1E] rounded-2xl p-4 overflow-hidden group min-[639px]:[clip-path:var(--clip-path-squircle-60)]" >
                            <div className="flex items-center cursor-pointer" onClick={() => toggleEventExpansion(event.id)}>
                                <div className="hidden sm:block relative w-100 h-50 overflow-hidden rounded-[2.5rem] mr-6">
                                    <Image src={normalizeImagePath(event.image_url)} alt={`Image de l'événement ${event.title}`} fill style={{ objectFit: 'cover' }} className="w-full h-50 object-cover group-hover:scale-110 transition duration-500 ease-in-out group-hover:rotate-1" />        
                                </div>
                                <div className="flex flex-row justify-between items-center max-w-2xl w-full">
                                    <div className="max-sm:pl-3">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-[#ff952aff]">{event.title}</h2>
                                        <p className="text-gray-700 dark:text-gray-500 text-sm mt-1">
                                            <CalendarDaysIcon className="inline-block w-4 h-4 mr-1" />
                                            {new Date(event.event_date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                                            <span className="ml-4"><MapPinIcon className="inline-block w-4 h-4 mr-1" /> {event.location}</span>
                                        </p>
                                        <p className="text-gray-700 dark:text-white/70 mt-2">Inscrits: {event.registered_count} / {event.available_seats}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 border-l-[0.2px] border-gray-300 dark:border-white/20 pl-2 ml-1 sm:ml-3">
                                        <IconButton onClick={() => handleEditClick(event)} className="text-indigo-600 hover:text-indigo-900" title="Modifier">
                                            <PencilIcon className="w-6 h-6" />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(event.id)} isLoading={deletingEventId === event.id} className="text-red-600 hover:text-red-900" title="Supprimer">
                                            <TrashIcon className="w-6 h-6" />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => toggleEventExpansion(event.id)}
                                            aria-expanded={expandedEventId === event.id}
                                            aria-controls={`participants-table-${event.id}`}
                                            title="Voir les participants"
                                        >
                                            <ChevronDownIcon className={`w-6 h-6 text-gray-800 transition-transform duration-300 ${expandedEventId === event.id ? 'rotate-180' : ''}`}/>
                                        </IconButton>
                                    </div>
                                </div>
                            </div>

                            {expandedEventId === event.id && (
                                <div id={`participants-table-${event.id}`} className="mt-6">
                                {loadingParticipants === event.id ? (
                                    <p className="text-center text-gray-700 dark:text-gray-500">Chargement des participants...</p>
                                ) : participants[event.id]?.length === 0 ? (
                                    <p className="text-center text-gray-700 dark:text-gray-500">Aucun participant inscrit pour cet événement.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/20 rounded-xl sm:rounded-3xl overflow-hidden">
                                            <tbody className="bg-white dark:bg-zinc-700 divide-y divide-gray-200 dark:divide-white/20">
                                            {participants[event.id]?.map((participant) => (
                                                <tr key={participant.user_id}>
                                                    <td className="px-1.5 sm:px-6 py-2 sm:py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">{participant.first_name}</td>
                                                    <td className="px-1 sm:px-6 py-2 sm:py-3 whitespace-nowrap text-sm text-gray-500  dark:text-white/70">{participant.email}</td>
                                                    <td className="px-1 sm:px-6 py-2 sm:py-3 hidden sm:table-cell whitespace-nowrap text-sm text-gray-500  dark:text-white/70">
                                                        {new Date(participant.registered_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                                                    </td>
                                                    <td className="px-1 sm:px-6 py-2 sm:py-3 whitespace-nowrap text-sm font-medium">
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
                    </div>
                ))}
                </div>
            )}
            <ActionButton variant="secondary" onClick={() => router.push(`/events`)} className="mt-10 translate-x-1/2" >                    
                <ChevronUpIcon className="inline-block size-6 mr-2 rotate-270 group-hover:animate-bounce" />
                <span>Page d&apos;accueil</span>
            </ActionButton>
        </>
    );

    return (
        <div className="max-w-[95%] mx-auto">
            {authStatus === 'loading' && (
                <p className="text-center text-xl text-gray-700 dark:text-white/70 py-10">Chargement de la session...</p>
            )}

            {message && (
                <div className={`fixed z-10000 w-full max-w-[85%] top-20 left-1/2 transform -translate-x-1/2 transition-all ease-out py-2 px-4 text-center text-base rounded-lg ${isSuccess ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                    {message}
                </div>
            )}
            
            {authStatus === 'authenticated' && (action === 'list' ? renderList() : renderForm())}

            <ConfirmationModal isOpen={isModalOpen} message={modalMessage} onConfirm={confirmAction || (() => {})} onCancel={closeConfirmationModal} />
        </div>
    );
}
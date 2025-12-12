'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import type { Session } from 'next-auth';
import Image from 'next/image';
import { PencilIcon , MapPinIcon } from '@heroicons/react/24/solid'; 
import { TrashIcon, PlusIcon, ChevronUpIcon, ChevronDownIcon, CalendarDaysIcon } from '@heroicons/react/16/solid';
import { normalizeImagePath } from '@/app/lib/utils';
import { Event, Participant } from '@/app/lib/definitions';
import { useToast } from '@/app/ui/status/ToastProvider'; 
import ActionButton from '@/app/ui/buttons/ActionButton';
import IconButton from '@/app/ui/buttons/IconButton';
import Loader from '@/app/ui/animation/Loader';

type EventManagementProps = {
    session: Session | null;
    openModal: (msg: string, actionFn: () => void) => void;
    closeModal: () => void;
};

export default function EventManagement({ session, openModal, closeModal }: EventManagementProps) {

    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [action, setAction] = useState<'list' | 'create' | 'edit'>('list');
    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
    const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
    const [participants, setParticipants] = useState<{ [eventId: number]: Participant[] }>({});
    const [loadingParticipants, setLoadingParticipants] = useState<number | null>(null);
    
    const { addToast } = useToast();

    const [title, setTitle] = useState('');
    const [descriptionShort, setDescriptionShort] = useState('');
    const [descriptionLong, setDescriptionLong] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [location, setLocation] = useState('');
    const [availableSeats, setAvailableSeats] = useState<number | ''>('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [price, setPrice] = useState<number | ''>('');

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
    const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
    const [unregisteringInfo, setUnregisteringInfo] = useState<{ userId: number; eventId: number } | null>(null);

    useEffect(() => {
        if (session) {
        fetchUserEvents();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    // ===== Fetch User Events =====
    const fetchUserEvents = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/account/events');
            const data = await res.json();
            if (res.ok) {
                setEvents(data);
            } else {
                addToast(data.message || 'Erreur lors du chargement des événements.', 'error');
                setEvents([]);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des événements", error);
            addToast('Une erreur est survenue lors du chargement des événements.', 'error');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleEventExpansion = async (eventId: number) => {
        if (expandedEventId === eventId) {
            setExpandedEventId(null);
        } else {
            setExpandedEventId(eventId);
            if (!participants[eventId]) {
                setLoadingParticipants(eventId);
                try {
                    const response = await fetch(`/api/account/registrations?eventId=${eventId}`);
                    const data = await response.json();
                    if (response.ok) {
                        setParticipants(prev => ({ ...prev, [eventId]: data.participants }));
                    } else {
                        addToast(data.message || 'Erreur lors du chargement des participants.', 'error');
                    }
                } catch (error) {
                    console.error('Failed to fetch participants:', error);
                    addToast('Une erreur est survenue lors du chargement des participants.', 'error');
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
                    addToast(uploadData.message || 'Erreur lors de l\'upload de l\'image.', 'error');
                    setUploadingImage(false);
                    setIsSubmittingEvent(false); 
                    return;
                }
            } catch (uploadError) {
                console.error('Erreur lors de l\'upload de l\'image:', uploadError);
                addToast('Une erreur est survenue lors de l\'upload de l\'image.', 'error');
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
            price: Number(price),
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
                addToast(data.message, 'success');
                fetchUserEvents();
                setTimeout(() => setAction('list'), 2000);
            } else {
                addToast(data.message || `Échec de ${action === 'create' ? 'la création' : 'la mise à jour'}.`, 'error');
            }
        } catch (error) {
            console.error(`Erreur lors de ${action === 'create' ? 'la création' : 'la mise à jour'}`, error);
            addToast(`Une erreur est survenue lors de ${action === 'create' ? 'la création' : 'la mise à jour'}.`, 'error');
        } finally {
            setIsSubmittingEvent(false); 
        }
    };

    const executeUnregister = async (userId: number, eventId: number) => {
        closeModal();
        setUnregisteringInfo({ userId, eventId });
        try {
            const response = await fetch('/api/account/registrations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'unregister_participant', userId, eventId }),
            });
            const data = await response.json();
            if (response.ok) {
                addToast(data.message, 'success');
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
                addToast(data.message || 'Erreur lors de la désinscription du participant.', 'error');
            }
        } catch (error) {
            console.error('Erreur lors de la désinscription du participant:', error);
            addToast('Une erreur est survenue lors de la désinscription.', 'error');
        } finally {
            setUnregisteringInfo(null); 
        }
    };

    const handleUnregisterParticipant = (userId: number, eventId: number, firstName: string) => {
        openModal(
            `Êtes-vous sûr de vouloir désinscrire ${firstName} de cet événement ?`,
            () => executeUnregister(userId, eventId)
        );
    };
    
    const executeDelete = async (eventId: number) => {
        closeModal();
        setDeletingEventId(eventId); 
        try {
            const response = await fetch('/api/account/events', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId: eventId }),
            });
            const data = await response.json();
            if (response.ok) {
                addToast(data.message, 'success');
                setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
            } else {
                addToast(data.message || 'Erreur lors de la suppression de l\'événement.', 'error');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'événement:', error);
            addToast('Une erreur est survenue lors de la suppression.', 'error');
        } finally {
            setDeletingEventId(null);
        }
    };

    const handleDelete = (eventId: number) => {
        openModal(
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
        setPrice(event.price);
        setImageUrl(event.image_url);
        setPreviewImage(event.image_url);
        setAction('edit');
    };

    // ======= Create/Update Events Form ===========
    const renderForm = () => (
        <form onSubmit={handleSubmit} className="w-full p-4 sm:p-6 md:px-8 md:py-10 xl:py-12 rounded-2xl md:rounded-3xl mx-auto bg-[#FCFFF7] dark:bg-[#1E1E1E] dark:text-white/85 sm:mb-15 max-lg:mt-4 border border-gray-300 dark:border-white/10 animate-slide-top translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative drop-shadow-[0_10px_15px_rgb(0,0,0,0.2)] hover:drop-shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:drop-shadow-[0_10px_12px_rgb(0,0,0,0.5)] dark:hover:drop-shadow-[0_12px_15px_rgb(0,0,0,0.8)] group shadow-[hsl(var(--always-black)/5.1%)]">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
                        <div className="relative">
                            <label htmlFor="availableSeats" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 dark:text-white/70 px-1 py-0 ml-4 bg-[#FCFFF7] dark:bg-[#1E1E1E]">Places</label>
                            <input type="number" id="availableSeats" value={availableSeats ?? ''} onChange={(e) => setAvailableSeats(Number(e.target.value))} required min="0" className="block w-full px-3 pb-2 pt-3 border border-gray-300 dark:border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0088aa] hover:border-[#0088aa] focus:border-[#0088aa] dark:focus:ring-[#ff952aff] dark:hover:border-[#ff952aff] dark:focus:border-[#ff952aff]" />
                        </div>
                        <div className="relative">
                            <label htmlFor="price" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 dark:text-white/70 px-1 py-0 ml-4 bg-[#FCFFF7] dark:bg-[#1E1E1E]">Prix (€)</label>
                            <input type="number" id="price" value={price ?? ''} onChange={(e) => setPrice(Number(e.target.value))} required min="0" step="0.01" className="block w-full px-3 pb-2 pt-3 border border-gray-300 dark:border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0088aa] hover:border-[#0088aa] focus:border-[#0088aa] dark:focus:ring-[#ff952aff] dark:hover:border-[#ff952aff] dark:focus:border-[#ff952aff]" />
                        </div>
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
                            <div className="mt-4 flex justify-center md:absolute bg-[#FCFFF7] dark:bg-[#1E1E1E] dark:text-white rounded-xl px-2 pb-2">
                                <Image
                                    src={previewImage || normalizeImagePath(imageUrl)}
                                    alt="Aperçu de l'image"
                                    width="200"
                                    height="120"
                                    style={{ objectFit: 'cover', height: '120px' }}
                                    className="rounded-md shadow-sm"
                                />
                            </div>
                        )}
                        {uploadingImage && (
                            <>
                                <p className="text-center text-sm text-gray-500 mt-2">Chargement de l&apos;image</p>
                                <Loader variant="dots" />
                            </>
                        )}
                    </div>

                    <div className="flex gap-4 mt-1">
                        <ActionButton
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                setAction('list');
                            }}
                            className="flex-1 rounded-r-xs!"
                        >
                            <ChevronUpIcon className="inline-block size-6 mr-2 rotate-270 group-hover:animate-bounce" /> 
                            <span>Annuler</span>
                        </ActionButton>
                        <ActionButton
                            type="submit"
                            variant="primary"
                            isLoading={isSubmittingEvent}
                            className="flex-1 rounded-l-xs!"
                        >
                            {isSubmittingEvent ? (
                                <span className="ml-3 truncate">
                                    {action === 'create' ? 'Création' : 'Mise à jour'}
                                </span>
                            ) : (
                                <>
                                    <span>
                                        {action === 'create' ? 'Créer' : 'Modifier'}
                                    </span>
                                    <ChevronUpIcon className="inline-block size-6 ml-2 rotate-90 group-hover:animate-bounce" />
                                </>
                            )}
                        </ActionButton>
                    </div>
                </div>
            </form>
    );

    // ========= Events List =============
    const renderEventList = () => (
        <div className="space-y-8 bg-white dark:bg-[#1E1E1E] rounded-xl p-1 sm:p-4 lg:p-8 mt-4 lg:mt-0 border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative shadow-[0_10px_15px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:shadow-[0_10px_12px_rgb(0,0,0,0.5)] dark:hover:shadow-[0_12px_15px_rgb(0,0,0,0.8)]">
            <div className="flex justify-center sm:justify-end lg:justify-between items-center gap-5 max-sm:mt-1 mb-8 border-b border-gray-300 dark:border-white/20 pb-4">
                <h2 className="hidden lg:flex text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-[#ff952aff]">Mes événements</h2>
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
                        setPrice('');
                        setPreviewImage(null);
                        setImageFile(null);
                    }}
                >
                    <PlusIcon className="inline-block size-5 mr-2 group-hover:animate-bounce" />
                    <span>Créer un événement</span>
                </ActionButton>
            </div>

            {loading ? (
                <>
                    <p className="text-center text-xl text-gray-700 dark:text-gray-300 mb-4">Chargement des événements</p>
                    <Loader variant="dots" />
                </>
            ) : events.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    <CalendarDaysIcon className="size-44 mx-auto mb-3 opacity-50" />
                    <p className="text-center  text-lg">
                        Vous n&apos;avez pas encore créé d&apos;événements.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 min-[1460px]:grid-cols-[repeat(auto-fit,minmax(696px,1fr))] gap-10 items-end">
                    {events.map((event) => (
                        <div key={event.id} className=" max-w-4xl w-full mx-auto translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease group drop-shadow-lg hover:drop-shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:drop-shadow-[0_10px_12px_rgb(0,0,0,0.5)] dark:hover:drop-shadow-[0_12px_15px_rgb(0,0,0,0.8)] shadow-[hsl(var(--always-black)/5.1%)]">
                            <div className=" w-full sm:bg-gray-300 dark:sm:bg-white/10 sm:p-[0.5px] min-[639px]:[clip-path:var(--clip-path-squircle-60)]"  data-aos="fade-up">
                                
                                {/* ========== Main container =========== */}
                                <div className="flex flex-col w-full bg-[#FCFFF7] dark:bg-[#222222] rounded-xl p-2 sm:p-4 max-sm:border border-gray-300 dark:border-white/10 overflow-hidden group min-[639px]:[clip-path:var(--clip-path-squircle-60)]" >
                                    
                                    {/* Image and details content */}
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

                                            {/* Buttons bar right side */}
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
                                                    <ChevronDownIcon className={`w-6 h-6 text-gray-800 transition-transform duration-700 ${expandedEventId === event.id ? 'rotate-180' : ''}`}/>
                                                </IconButton>
                                            </div>
                                        </div>
                                    </div>

                                    {/* =========== Participants list ============ */}
                                    <div className={`overflow-hidden transition-all duration-700 ease-in-out ${expandedEventId === event.id ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
                                        {expandedEventId === event.id && (
                                            <div id={`participants-table-${event.id}`} className="mt-4">
                                                {loadingParticipants === event.id ? (
                                                    <>
                                                        <p className="text-center text-gray-700 dark:text-gray-500 mb-2">Chargement des participants</p>
                                                        <Loader variant="dots" />
                                                    </>
                                                ) : participants[event.id]?.length === 0 ? (
                                                    <p className="text-center text-gray-700 dark:text-gray-500">Aucun participant inscrit pour cet événement.</p>
                                                ) : (
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/20 rounded-xl sm:rounded-3xl overflow-hidden">
                                                            <tbody className="bg-gray-100 dark:bg-zinc-700 divide-y divide-gray-200 dark:divide-white/20">
                                                                {participants[event.id]?.map((participant) => (
                                                                    <tr key={participant.user_id}>
                                                                        <td className="px-1.5 sm:px-6 py-2 sm:py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-300">{participant.first_name} {participant.last_name}</td>
                                                                        <td className="px-1 sm:px-6 py-2 sm:py-3 hidden sm:table-cell whitespace-nowrap text-sm text-gray-500  dark:text-white/70">{participant.email}</td>
                                                                        <td className="px-1 sm:px-6 py-2 sm:py-3 hidden sm:table-cell whitespace-nowrap text-sm text-gray-500  dark:text-white/70">
                                                                            {new Date(participant.registered_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                                                                        </td>
                                                                        <td className="px-1 sm:px-6 py-2 sm:py-3 whitespace-nowrap text-sm font-medium">
                                                                            <ActionButton
                                                                                variant="destructive"
                                                                                onClick={() => handleUnregisterParticipant(participant.user_id, event.id, participant.first_name)}
                                                                                isLoading={unregisteringInfo?.userId === participant.user_id && unregisteringInfo?.eventId === event.id}
                                                                                className="max-md:p-1 md:py-2 text-sm"
                                                                                title="Désinscrire"    
                                                                            >                                                            
                                                                                {!unregisteringInfo && ( <TrashIcon className="max-md:size-5 size-4" /> )}
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
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return action === 'list' ? renderEventList() : renderForm();
}
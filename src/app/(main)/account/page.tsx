'use client';

import type { Session } from 'next-auth';
import React, { useState, useEffect, FormEvent } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, CalendarDaysIcon, MapPinIcon, ArrowUpIcon, FingerPrintIcon, InformationCircleIcon } from '@heroicons/react/24/outline'; 
import Image from 'next/image';
import { normalizeImagePath } from '@/app/lib/utils';
import Link from 'next/link';
import { Event } from '@/app/lib/definitions'; 
import ConfirmationModal from '@/app/ui/confirmation-modal'; 
import FloatingLabelInput from '@/app/ui/FloatingLabelInput';


interface Participant {
  user_id: string;
  username: string;
  email: string;
  registered_at: string;
}

export default function UserAccountManageEventsPage() {

    // const [session, setSession] = useState<any>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

    const [username, setUserName] = useState('');
    const [email, setEmail] = useState('');

    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [action, setAction] = useState<'list' | 'create' | 'edit'>('list');
    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
    const [isEditingInfo, setIsEditingInfo] = useState(false);

  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<{ [eventId: string]: Participant[] }>({});
  const [loadingParticipants, setLoadingParticipants] = useState<string | null>(null);


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

    // confirmation modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

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
            setUserName(session.user.username ?? '');
            setEmail(session.user.email ?? '');
            fetchUserEvents();
        }
    }, [authStatus, session]);


    const handleUpdateAccount = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage('');
        try {
        const response = await fetch('/api/account/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email }),
        });
        const data = await response.json();

        if (response.ok) {
            setMessage('Informations de compte mises à jour avec succès.');
            setIsSuccess(true);
        } else {
            setMessage(data.message || 'Échec de la mise à jour des informations.');
            setIsSuccess(false);
        }
        } catch (error) {
        console.error('Erreur lors de la mise à jour du compte:', error);
        setMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
        setIsSuccess(false);
        }
    };


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
            setMessage('Une erreur est survenue lors du chargement des événements.');
            setEvents([]);
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    };


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
        const response = await fetch(`/api/account/registrations?eventId=${eventId}`); // GET participants for event
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


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setPreviewImage(imageUrl); // Revert to current image if no new file selected
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);

    let finalImageUrl = imageUrl; // Start with existing image URL

    // If a new image file is selected, upload it first
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
          finalImageUrl = uploadData.imageUrl; // Use the URL returned by the upload API
          setMessage(uploadData.message);
          setIsSuccess(true);
        } else {
          setMessage(uploadData.message || 'Erreur lors de l\'upload de l\'image.');
          setIsSuccess(false);
          setUploadingImage(false);
          return; // Stop if image upload fails
        }
      } catch (uploadError) {
        console.error('Erreur lors de l\'upload de l\'image:', uploadError);
        setMessage('Une erreur est survenue lors de l\'upload de l\'image.');
        setIsSuccess(false);
        setUploadingImage(false);
        return; // Stop if image upload fails
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
            setMessage(`Une erreur est survenue lors de ${action === 'create' ? 'la création' : 'la mise à jour'}.`);
            setIsSuccess(false);
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

  // This function will be called when the modal confirms
  const executeUnregister = async (userId: string, eventId: string) => {
    closeConfirmationModal(); // Close the modal first
    setMessage('');
    setIsSuccess(false);

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


    const executeDelete = async (eventId: string) => {
        closeConfirmationModal(); 
        setMessage('');
        setIsSuccess(false);

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
        }
    };

    const handleDelete = (eventId: string) => {
        openConfirmationModal(
        'Êtes-vous sûr de vouloir supprimer cet événement ? Toutes les inscriptions associées seront également supprimées.',
        () => executeDelete(eventId)
        );
    };


    const handleEditClick = (event: Event) => {
        setCurrentEvent(event);
        setTitle(event.title);
        setDescriptionShort(event.description_short);
        setDescriptionLong(event.description_long);
        
        // Format date for input type="datetime-local"
        const date = new Date(event.event_date);
        const formattedDate = date.toISOString().slice(0, 16);
        setEventDate(formattedDate);
        setLocation(event.location);
        setAvailableSeats(event.available_seats);
        setImageUrl(event.image_url);
        setPreviewImage(event.image_url);
        setAction('edit');
    };

    // Form to create and edit an event
    const renderForm = () => (
        <form onSubmit={handleSubmit} className="max-w-5xl p-6 md:px-8 md:py-10 xl:py-12 rounded-2xl shadow-xl mx-auto bg-[rgb(248,248,236)] sm:mb-15">
            <h2 className="text-3xl font-bold mb-6 sm:mb-10 text-gray-800 text-center">{action === 'create' ? 'Créer un événement' : 'Modifier l\'événement'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
                <div className="relative">
                    <label htmlFor="title" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 px-1 py-0 ml-4 bg-[rgb(248,248,236)]">Titre</label>
                    <input type="text" id="title" name="title" value={title ?? ''} onChange={(e) => setTitle(e.target.value)} required className="block w-full px-3 pb-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#ff952aff] hover:border-[#ff952aff] focus:border-[#ff952aff]" />
                </div>
                <div className="relative">
                    <label htmlFor="eventDate" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 px-1 py-0 ml-4 bg-[rgb(248,248,236)]">Date et heure</label>
                    <input type="datetime-local" id="eventDate" name="event_date" value={eventDate ?? ''} onChange={(e) => setEventDate(e.target.value)} required className="block w-full px-3 pb-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#ff952aff] hover:border-[#ff952aff] focus:border-[#ff952aff]" />
                </div>
                <div className="relative">
                    <label htmlFor="location" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 px-1 py-0 ml-4 bg-[rgb(248,248,236)]">Lieu</label>
                    <input type="text" id="location" value={location ?? ''} onChange={(e) => setLocation(e.target.value)} required className="block w-full px-3 pb-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#ff952aff] hover:border-[#ff952aff] focus:border-[#ff952aff]" />
                </div>
                <div className="relative">
                    <label htmlFor="availableSeats" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 px-1 py-0 ml-4 bg-[rgb(248,248,236)]">Places disponibles</label>
                    <input type="number" id="availableSeats" value={availableSeats ?? ''} onChange={(e) => setAvailableSeats(Number(e.target.value))} required min="0" className="block w-full px-3 pb-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#ff952aff] hover:border-[#ff952aff] focus:border-[#ff952aff]" />
                </div>
                <div className="relative md:col-span-2">
                    <label htmlFor="descriptionShort" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 px-1 py-0 ml-4 bg-[rgb(248,248,236)]">Description courte</label>
                    <textarea id="descriptionShort" name="description_short" value={descriptionShort ?? ''} onChange={(e) => setDescriptionShort(e.target.value)} required className="block w-full px-3 pb-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#ff952aff] hover:border-[#ff952aff] focus:border-[#ff952aff]" rows={2}></textarea>
                </div>
                <div className="relative md:col-span-2">
                    <label htmlFor="descriptionLong" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 px-1 py-0 ml-4 bg-[rgb(248,248,236)]">Description longue</label>
                    <textarea id="descriptionLong" name="description_long" value={descriptionLong ?? ''} onChange={(e) => setDescriptionLong(e.target.value)} required className="block w-full px-3 pb-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#ff952aff] hover:border-[#ff952aff] focus:border-[#ff952aff]" rows={4}></textarea>
                </div>
                <div className="relative ">
                    <label htmlFor="image" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 px-1 py-0 ml-4 bg-[rgb(248,248,236)]">Image de l&apos;événement</label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        accept="image/*"
                        className="mt-1 block w-full text-sm text-gray-500 rounded-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#F0EEE5] file:text-gray-700 hover:file:bg-[#E8E5D8] px-3 pb-2 pt-3 border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#ff952aff] hover:border-[#ff952aff] focus:border-[#ff952aff]"
                        onChange={handleImageChange}
                        disabled={uploadingImage}
                    />
                    {(previewImage || imageUrl) && (
                        <div className="mt-4 flex justify-center sm:absolute bg-[rgb(248,248,236)] sm:shadow-[0px_20px_15px_rgba(0,_0,_0,_0.1)] rounded-xl px-2 pb-2">
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
                <div className="flex flex-col sm:flex-row sm:justify-end gap-4 mt-4">
                    <button
                        type="button"
                        onClick={() => {
                            setAction('list');
                            setMessage('');
                        }}
                        className=" h-11 min-w-32 inline-flex items-center justify-center px-5 py-2 rounded-full text-base text-[#FFF] hover:text-gray-800 font-medium transition-colors border-[0.5px] border-transparent shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-gray-600 hover:bg-[#FFF] hover:border-gray-800 cursor-pointer duration-300 ease-in-out group"
                    >
                        <ArrowUpIcon className="inline-block w-4 h-4 mr-2 rotate-270 group-hover:animate-bounce" /> 
                        <span>Annuler</span>
                    </button>
                    <button
                        type="submit"
                        className="h-11 min-w-32 px-5 py-2 rounded-full text-base text-[#FFF] whitespace-nowrap hover:text-gray-800 font-medium transition-colors border-[0.5px] border-transparent shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-gray-800 hover:bg-amber-50 hover:border-gray-800 cursor-pointer duration-300 ease-in-out group"
                        disabled={uploadingImage}
                    >
                        <PlusIcon className="inline-block w-4 h-4 mr-2 group-hover:animate-bounce" />
                        {action === 'create' ? 'Créer' : 'Mettre à jour'}
                    </button>
                </div>
            </div>

        </form>
    );
    // -------------- Account and user events owner
    const renderList = () => (
        <>
            <div className="relative mt-6 mb-12 max-w-3xl mx-auto group">
                {!isEditingInfo ? (
                    <div
                        onClick={() => setIsEditingInfo(true)}
                        className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 items-center gap-6 px-6 pt-6 sm:pt-1 rounded-2xl text-base font-medium group border-[0.5px] shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-[#F0EEE5] hover:bg-[#E8E5D8] group-hover:bg-[#E8E5D8] hover:border-transparent mx-auto transition-all duration-300 ease-in-out">
                        
                        <h2 className="absolute z-10 px-3 py-2 rounded-3xl text-3xl sm:text-4xl right-0 top-0 -translate-y-1/2 font-extrabold text-gray-900 mr-6 sm:mr-12 bg-[#F0EEE5] group-hover:bg-[#E8E5D8] border-t-[0.2px] group transition-all duration-300 ease-in-out">
                            Mon Compte
                        </h2>
                        <h3 className="md:col-span-2 inline-flex items-center text-2xl font-bold mb-3"><FingerPrintIcon className="inline-block w-10 h-10 mr-2" />Mes identifiants</h3>
                        <div className="relative">
                            <p className="absolute right-0 top-0 -translate-y-1/2 text-gray-500 px-1 py-0 mr-6 bg-[#F0EEE5] group-hover:bg-[#E8E5D8] transition-colors duration-300">Nom d&apos;utilisateur</p>
                            {session && (<p className="block w-full h-12 px-3 pb-2 pt-3 border border-gray-300 text-lg text-start rounded-md shadow-sm"> {session.user.username} </p>)}
                        </div>
                        <div className="relative">
                            <p className="absolute right-0 top-0 -translate-y-1/2 text-gray-500 px-1 py-0 mr-6 bg-[#F0EEE5] group-hover:bg-[#E8E5D8] transition-colors duration-300">Adresse mail</p>
                            {session && (<p className="block w-full h-12 px-3 pb-2 pt-3 border border-gray-300 text-lg text-start rounded-md shadow-sm"> {session.user.email} </p>)}
                        </div>
                        <div className="md:col-span-2 h-full mx-auto w-full max-w-[90%] border-t-[0.2px] group-hover:border-gray-400"></div>
                        <p className="group-hover:bg-black/10 rounded-full p-2 md:col-span-2 text-center transition-colors duration-300"><FingerPrintIcon className="inline-block w-4 h-4 mr-1 group-hover:animate-bounce" />Modifier mes identifiants</p>
                        <div className="relative md:col-span-2 w-full">
                        <div className="absolute bottom-0 w-full overflow-hidden whitespace-nowrap">
                            {session && (
                            <p className="animate-banner inline-flex items-center text-center text-sm text-gray-500 w-full">
                                <InformationCircleIcon className="w-5 h-5 inline-block mr-2"/>
                                <span>Bonjour {session.user.username} ! Gérez vos informations personnelles et vos événements !</span>
                            </p>
                            )}
                        </div>
                        </div>

                    </div>
                ) : (
                    <div className="relative max-w-md mx-auto bg-[rgb(248,248,236)] p-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out">
                        <h2 className="absolute z-10 px-3 py-1 rounded-t-2xl text-xl right-0 top-0 -translate-y-1/2 font-bold text-gray-500 mr-8 bg-[rgb(248,248,236)]">
                            Mon Compte
                        </h2>
                        <button
                        type="button"
                        onClick={() => setIsEditingInfo(false)}
                        className="absolute z-0 top-4 right-4 text-gray-500 hover:text-[#ff952aff] text-2xl font-bold"
                        aria-label="Quitter"
                        title="Quitter"
                        >
                            &times;
                        </button>
                        <h3 className="flex items-center justify-center text-2xl font-bold text-gray-900 mb-6">
                            <FingerPrintIcon className="w-8 h-8 mr-2" />
                            <span className="text-center">Modifier mes identifiants</span>
                        </h3>
                        <form className="space-y-6" onSubmit={handleUpdateAccount}>
                            <FloatingLabelInput
                                id="username"
                                label="Nom d'utilisateur"
                                type="text"
                                value={username ?? ''}
                                onChange={(e) => setUserName(e.target.value)}
                                required
                            />
                            <FloatingLabelInput
                                id="email"
                                label="Adresse email"
                                type="email"
                                value={email ?? ''}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditingInfo(false)} 
                                    className=" h-11 inline-flex items-center justify-center px-5 py-2 rounded-full text-base text-[#FFF] hover:text-gray-800 font-medium transition-colors border-[0.5px] border-transparent shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-gray-600 hover:bg-[#FFF] hover:border-gray-800 cursor-pointer duration-300 ease-in-out group"
                                >
                                    <ArrowUpIcon className="inline-block w-4 h-4 mr-2 rotate-270 group-hover:animate-bounce" /> 
                                    <span>Annuler</span>
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-full text-base text-[#FFF] hover:text-gray-800 font-medium transition-colors border-[0.5px] border-transparent shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-gray-800 hover:bg-amber-50 hover:border-gray-800 cursor-pointer duration-300 ease-in-out"
                                    >
                                    Mettre à jour
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-evenly gap-5 items-center mb-6 mt-8">
                <h2 className="text-3xl font-extrabold text-gray-900">Mes événements</h2>
                <button
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
                    className="h-11 inline-flex items-center justify-center px-5 py-2 rounded-full text-base text-[#FFF] hover:text-gray-800 font-medium transition-colors border-[0.5px] border-transparent shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-gray-800 hover:bg-amber-50 hover:border-gray-800 cursor-pointer duration-300 ease-in-out group">
              <PlusIcon className="inline-block w-4 h-4 mr-2 group-hover:animate-bounce" />
              <span>Créer un événement</span>
                </button>
            </div>

            {loading ? (
                <p className="text-center text-xl text-gray-700">Chargement des événements...</p>
            ) : events.length === 0 ? (
                <p className="text-center text-gray-600 text-lg">
                    Vous n&apos;avez pas encore créé d&apos;événements.
                </p>
            ) : (

            // ------- EVENTS ------------
            <div className="grid grid-cols-1 [@media(min-width:1600px)]:grid-cols-2 gap-10">
            {events.map((event) => (
                <div key={event.id} className="max-w-5xl w-full bg-white/95 rounded-2xl shadow-lg p-4 mx-auto overflow-hidden group" data-aos="fade-up">
                
                
                <div
                    className="flex  items-center cursor-pointer"
                    onClick={() => toggleEventExpansion(event.id)}
                >
                    <div className="hidden md:block relative w-80 h-50 overflow-hidden rounded-lg mr-6">
                        <Image
                            src={normalizeImagePath(event.image_url)}
                            alt={`Image de l'événement ${event.title}`}
                            fill
                            style={{ objectFit: 'cover' }}
                            className="w-full h-50 object-cover group-hover:scale-110 transition duration-500 ease-in-out group-hover:rotate-1"
                        />        
                    </div>

                    <div className="flex flex-row justify-between items-center max-w-2xl w-full">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
                            <p className="text-gray-600 text-sm mt-1">
                                <CalendarDaysIcon className="inline-block w-4 h-4 mr-1" />
                                {new Date(event.event_date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                                <span className="ml-4">
                                <MapPinIcon className="inline-block w-4 h-4 mr-1" /> {event.location}
                                </span>
                            </p>
                            <p className="text-gray-700 mt-2">
                                Inscrits: {event.registered_count} / {event.available_seats}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 border-l-[0.2px] border-gray-300 pl-2 ml-1 sm:ml-3">
                            <button
                                onClick={() => handleEditClick(event)}
                                className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                title="Modifier"
                            >
                                <PencilIcon className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => handleDelete(event.id)}
                                className="text-red-600 hover:text-red-900 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                title="Supprimer"
                            >
                                <TrashIcon className="w-6 h-6" />
                            </button>

                            <button
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                            aria-expanded={expandedEventId === event.id}
                            aria-controls={`participants-table-${event.id}`}
                            title="Voir les participants"
                            >
                                <svg className={`w-6 h-6 text-gray-800 transition-transform duration-300 ${expandedEventId === event.id ? 'rotate-180' : ''}`}
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

              {expandedEventId === event.id && (
                <div id={`participants-table-${event.id}`} className="mt-6">
                  {loadingParticipants === event.id ? (
                    <p className="text-center text-gray-600">Chargement des participants...</p>
                  ) : participants[event.id]?.length === 0 ? (
                    <p className="text-center text-gray-600">Aucun participant inscrit pour cet événement.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom d&apos;utilisateur</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inscrit le</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {participants[event.id]?.map((participant) => (
                            <tr key={participant.user_id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{participant.username}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{participant.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(participant.registered_at).toLocaleString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleUnregisterParticipant(participant.user_id, event.id, participant.username)}
                                  className="text-red-600 hover:text-red-900 border-1 rounded-full bg-white hover:bg-amber-50 px-2.5 pb-1 pt-0.5 shadow-lg h-7 flex items-center justify-center"
                                >
                                  <TrashIcon className="w-4 h-4" /> Désinscrire
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
                <Link href="/events" className="h-11 inline-flex items-center justify-center mt-3 px-5 py-2 rounded-full text-base text-[#FFF] hover:text-[#ff952aff] font-medium transition-colors group border-[0.5px] border-transparent shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-gray-800 hover:bg-[#FFF] hover:border-[#ff952aff] cursor-pointer duration-300 ease-in-out"
                >
                    <ArrowUpIcon className="inline-block w-4 h-4 mr-2 rotate-270 group-hover:animate-bounce" />
                    <span>Page d&apos;accueil</span>
                </Link>
            </div>
        </>
    );

    return (
        <div className="w-full mx-auto">

            {authStatus === 'loading' && (
                <p className="text-center text-xl text-gray-700 py-10">Chargement de la session...</p>
            )}

            {message && (
                <div className={`p-4 rounded-lg mb-6 text-center ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                </div>
            )}
            
            {authStatus === 'authenticated' && (action === 'list' ? renderList() : renderForm())}

            <ConfirmationModal
                isOpen={isModalOpen}
                message={modalMessage}
                onConfirm={confirmAction || (() => {})}
                onCancel={closeConfirmationModal}
            />
        </div>
    );
}


'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useToast } from '@/app/ui/status/ToastProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { normalizeImagePath } from '@/app/lib/utils';
import { Event } from '@/app/lib/definitions'; 
import { PencilIcon } from '@heroicons/react/24/solid'; 
import { PlusIcon, TrashIcon, ChevronUpIcon } from '@heroicons/react/16/solid'; 
import ConfirmationModal from '@/app/ui/ConfirmationModal'; 
import ActionButton from '@/app/ui/buttons/ActionButton';
import IconButton from '@/app/ui/buttons/IconButton';
import Loader from '@/app/ui/animation/Loader'


export default function ManageEventsPage() { 
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    const { addToast } = useToast();

    const [action, setAction] = useState<'list' | 'create' | 'edit'>('list');
    const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

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

    // confirmation modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();

    // Fetch events on component mount or when action changes
    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/admin/events');
                const data = await response.json();
                if (response.ok) {
                setEvents(data.events);
                } else {
                    addToast(data.message || 'Erreur lors du chargement des événements.', 'error');
                }
            } catch (error) {
                console.error('Failed to fetch events:', error);
                addToast('Une erreur est survenue lors du chargement des événements.', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (action === 'list') {
            fetchEvents();
        }
    }, [action]);

    // Handle URL parameters for edit action
    useEffect(() => {
        const actionParam = searchParams.get('action');
        const idParam = searchParams.get('id');

        if (actionParam === 'edit' && idParam) {
            const eventToEdit = events.find(e => Number(e.id) === Number(idParam));
            if (eventToEdit) {
                setCurrentEvent(eventToEdit);
                setTitle(eventToEdit.title);
                setDescriptionShort(eventToEdit.description_short);
                setDescriptionLong(eventToEdit.description_long);
                // Format date for input type="datetime-local"
                const date = new Date(eventToEdit.event_date);
                const formattedDate = date.toISOString().slice(0, 16);
                setEventDate(formattedDate);
                setLocation(eventToEdit.location);
                setAvailableSeats(eventToEdit.available_seats);
                setImageUrl(eventToEdit.image_url);
                setPrice(eventToEdit.price);

                setPreviewImage(eventToEdit.image_url);
                setAction('edit');
            } else if (!loading) { // If not loading and event not found, redirect to list
                addToast('Événement non trouvé pour la modification.');
                router.push('/admin/manage-events');
                setAction('list');
            }
        } else if (actionParam === 'create') {
            setAction('create');
            resetForm();
        } else {
            setAction('list');
            resetForm();
        }
    }, [searchParams, events, loading, router]);

    const resetForm = () => {
        setTitle('');
        setDescriptionShort('');
        setDescriptionLong('');
        setEventDate('');
        setLocation('');
        setAvailableSeats('');
        setImageUrl(null);
        setPrice('');
        setImageFile(null);
        setPreviewImage(null);
        setCurrentEvent(null);
        addToast('');
        setUploadingImage(false);
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
        setIsSubmittingEvent(true);
        addToast('');

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
                addToast(uploadData.message);
            } else {
                addToast(uploadData.message || 'Erreur lors de l\'upload de l\'image.', 'error');
                setUploadingImage(false);
                setIsSubmittingEvent(false);
                return; // Stop if image upload fails
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

        const eventData = {
            title,
            description_short: descriptionShort,
            description_long: descriptionLong,
            event_date: eventDate,
            location,
            available_seats: Number(availableSeats),
            image_url: finalImageUrl, // Use the uploaded URL or existing URL
            price: Number(price),
        };

        let response;
        if (action === 'create') {
            response = await fetch('/api/admin/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create', ...eventData }),
            });
        } else if (action === 'edit' && currentEvent) {
            response = await fetch('/api/admin/events', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: currentEvent.id, ...eventData }),
            });
        } else {
            addToast('Action non valide.');
            setIsSubmittingEvent(false);
            return;
        }

        const data = await response.json();
        setIsSubmittingEvent(false);
        if (response.ok) {
            addToast(data.message);
            resetForm();
            ; 
            setTimeout(() => router.push('/admin/manage-events'), 2000);
        } else {
            addToast(data.message || 'Erreur lors de l\'opération.', 'error');
        }
    };

    // ==== Function to open/close the confirmation modal====
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
    const executeDelete = async (eventId: number) => {
        closeConfirmationModal(); 
        addToast('');
        setDeletingEventId(eventId); 

        try {
            const response = await fetch('/api/admin/events', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: eventId }),
            });
            const data = await response.json();
            if (response.ok) {
                addToast(data.message);
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
        openConfirmationModal(
            'Êtes-vous sûr de vouloir supprimer cet événement ? Toutes les inscriptions associées seront également supprimées.',
            () => executeDelete(eventId)
        );
    };

    if (loading && action === 'list') {
        return <>
            <p className="text-center text-gray-700 text-lg mb-4">Chargement des événements</p>
            <Loader variant="dots" />;
        </>
    }

    return (
        <div className="p-3">

            {/* ===== Create / Edit an event ===== */}

            {(action === 'create' || action === 'edit') && (
                <form onSubmit={handleSubmit} className="max-w-5xl p-6 md:px-8 md:pb-10 xl:pb-12 rounded-2xl shadow-xl mx-auto bg-white sm:mb-15">
                    <h2 className="text-3xl font-bold mb-6 sm:mb-10 text-gray-800 text-center">{action === 'create' ? 'Créer un événement' : action === 'edit' ? 'Modifier l\'événement' : 'Gérer les Événements'}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
                        <div className="relative group">
                            <input type="text" id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="peer block w-full px-3 pb-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0676bdff] hover:border-[#0676bdff] focus:border-[#0676bdff]" />
                            <label htmlFor="title" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 group-hover:text-[#0676bdff] peer-focus:text-[#0676bdff] px-1 py-0 ml-4 bg-white">Évènement</label>
                        </div>
                        <div className="relative group">
                            <input type="datetime-local" id="event_date" name="event_date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required className="peer block w-full px-3 pb-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0676bdff] hover:border-[#0676bdff] focus:border-[#0676bdff]" />
                            <label htmlFor="event_date" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 group-hover:text-[#0676bdff] peer-focus:text-[#0676bdff] px-1 py-0 ml-4 bg-white">Date et heure</label>
                        </div>
                        <div className="relative group">
                            <input type="text" id="location" name="location" value={location} onChange={(e) => setLocation(e.target.value)} required className="peer block w-full px-3 pb-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0676bdff] hover:border-[#0676bdff] focus:border-[#0676bdff]" />
                            <label htmlFor="location" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 group-hover:text-[#0676bdff] peer-focus:text-[#0676bdff] px-1 py-0 ml-4 bg-white">Lieu</label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
                            <div className="relative group">
                                <input type="number" id="available_seats" value={availableSeats} onChange={(e) => setAvailableSeats(Number(e.target.value))} required min="0" className="peer block w-full px-3 pb-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0676bdff] hover:border-[#0676bdff] focus:border-[#0676bdff]" />
                                <label htmlFor="availableSeats_seats" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 group-hover:text-[#0676bdff] peer-focus:text-[#0676bdff] px-1 py-0 ml-4 bg-white">Places</label>
                            </div>
                            <div className="relative group">
                                <input type="number" id="price" value={price} onChange={(e) => setPrice(Number(e.target.value))} required min="0" step="0.01" className="peer block w-full px-3 pb-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0676bdff] hover:border-[#0676bdff] focus:border-[#0676bdff]" />
                                <label htmlFor="price" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 group-hover:text-[#0676bdff] peer-focus:text-[#0676bdff] px-1 py-0 ml-4 bg-white">Prix (€)</label>
                            </div>
                        </div>
                        <div className="relative group md:col-span-2">
                            <textarea id="description_short" name="description_short" value={descriptionShort} onChange={(e) => setDescriptionShort(e.target.value)} required className="peer block w-full px-3 pb-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0676bdff] hover:border-[#0676bdff] focus:border-[#0676bdff]" rows={2}></textarea>
                            <label htmlFor="description_short" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 group-hover:text-[#0676bdff] peer-focus:text-[#0676bdff] px-1 py-0 ml-4 bg-white">Description courte</label>
                        </div>
                        <div className="relative group md:col-span-2">
                            <textarea id="description_long" name="description_long" value={descriptionLong} onChange={(e) => setDescriptionLong(e.target.value)} required className="peer block w-full px-3 pb-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0676bdff] hover:border-[#0676bdff] focus:border-[#0676bdff]" rows={4}></textarea>
                            <label htmlFor="description_long" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 group-hover:text-[#0676bdff] peer-focus:text-[#0676bdff] px-1 py-0 ml-4 bg-white">Description longue</label>
                        </div>
                        <div className="relative group">
                            <input
                                type="file"
                                id="image"
                                name="image"
                                accept="image/*"
                                className="peer mt-1 block w-full text-sm text-gray-500 rounded-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FCFFF7] file:text-gray-700 hover:file:bg-[#E8E5D8] px-3 pb-2 pt-3 border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0676bdff] hover:border-[#0676bdff] focus:border-[#0676bdff]"
                                onChange={handleImageChange}
                                disabled={uploadingImage}
                            />
                            <label htmlFor="image" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 group-hover:text-[#0676bdff] peer-focus:text-[#0676bdff] px-1 py-0 ml-4 bg-white">Image de l&apos;événement</label>
                            {(previewImage || imageUrl) && (
                                <div className="mt-4 flex justify-center sm:absolute bg-white sm:shadow-[0px_20px_15px_rgba(0,_0,_0,_0.1)] rounded-xl px-2 pb-2">
                                    <Image
                                        src={previewImage || normalizeImagePath(imageUrl)}
                                        alt="Aperçu de l'image"
                                        width={200}
                                        height={150}
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
                                onClick={() => router.push('/admin/manage-events')}
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
            )}

            {/* ========= Events list ================= */}
            {action === 'list' && (
                <>
                    <div className="mb-6 text-center flex justify-end">
                        <ActionButton variant="primary" onClick={() => router.push(`/admin/manage-events?action=create`)} className="group" >                    
                        <PlusIcon className="inline-block size-5 mr-2 group-hover:animate-bounce" />
                        <span>Créer un événement</span>
                        </ActionButton>
                    </div>

                    {events.length === 0 ? (
                        <p className="text-center text-gray-700 text-lg">Aucun événement à gérer pour le moment.</p>
                    ) : (
                        <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Événement</th>
                                        <th className="px-6 py-3 hidden sm:table-cell text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 hidden lg:table-cell text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lieu</th>
                                        <th className="px-6 py-3 hidden sm:table-cell text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Places Disp.</th>
                                        <th className="px-6 py-3 hidden min-[900px]:table-cell text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inscrits</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {events.map((event) => (
                                        <tr key={event.id}>
                                            <td className="px-6 py-4 min-w-46 sm:min-w-55 min-[1025px]:whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                                            <td className="px-6 py-4 hidden sm:table-cell whitespace-nowrap text-sm text-gray-500">
                                                {new Date(event.event_date).toLocaleString('fr-FR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 min-w-55 hidden lg:table-cell text-sm text-gray-500">{event.location}</td>
                                            <td className="px-6 py-4 hidden sm:table-cell whitespace-nowrap text-sm text-gray-500">{event.available_seats}</td>
                                            <td className="px-6 py-4 hidden min-[900px]:table-cell whitespace-nowrap text-sm text-gray-500">{event.registered_count}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex justify-between gap-2">
                                                <IconButton onClick={() => router.push(`/admin/manage-events?action=edit&id=${event.id}`)} className="text-indigo-600 hover:text-indigo-900" title="Modifier">
                                                    <PencilIcon className="w-6 h-6" />
                                                </IconButton>
                                                <IconButton onClick={() => handleDelete(event.id)} isLoading={deletingEventId === event.id} className="text-red-600 hover:text-red-900" title="Supprimer">
                                                    <TrashIcon className="size-5" />
                                                </IconButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            <div className="mt-10 text-center">
                <ActionButton variant="primary" onClick={() => router.push(`/admin/dashboard`)} className="group" >                    
                    <ChevronUpIcon className="inline-block size-6 mr-2 rotate-270 group-hover:animate-bounce" />
                    <span>Tableau de bord</span>
                </ActionButton>
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

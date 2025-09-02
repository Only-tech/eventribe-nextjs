'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { normalizeImagePath } from '@/app/lib/utils';
import { Event } from '@/app/lib/definitions'; 
import { PlusIcon, PencilIcon, TrashIcon, ArrowUpIcon } from '@heroicons/react/24/outline'; 
import ConfirmationModal from '@/app/ui/confirmation-modal'; 

export default function ManageEventsPage() { 
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
          setMessage(data.message || 'Erreur lors du chargement des événements.');
          setIsSuccess(false);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setMessage('Une erreur est survenue lors du chargement des événements.');
        setIsSuccess(false);
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
      // const eventToEdit = events.find(e => e.id === Number(idParam));
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
        setPreviewImage(eventToEdit.image_url);
        setAction('edit');
      } else if (!loading) { // If not loading and event not found, redirect to list
        setMessage('Événement non trouvé pour la modification.');
        setIsSuccess(false);
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
  }, [searchParams, events, loading, router]); // Added router to dependencies

  const resetForm = () => {
    setTitle('');
    setDescriptionShort('');
    setDescriptionLong('');
    setEventDate('');
    setLocation('');
    setAvailableSeats('');
    setImageUrl(null);
    setImageFile(null);
    setPreviewImage(null);
    setCurrentEvent(null);
    setMessage('');
    setIsSuccess(false);
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

    const eventData = {
      title,
      description_short: descriptionShort,
      description_long: descriptionLong,
      event_date: eventDate,
      location,
      available_seats: Number(availableSeats),
      image_url: finalImageUrl, // Use the uploaded URL or existing URL
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
      setMessage('Action non valide.');
      setIsSuccess(false);
      return;
    }

    const data = await response.json();
    if (response.ok) {
      setMessage(data.message);
      setIsSuccess(true);
      resetForm();
      router.push('/admin/manage-events'); // Redirect to list view after success
    } else {
      setMessage(data.message || 'Erreur lors de l\'opération.');
      setIsSuccess(false);
    }
  };

  // Function to open the confirmation modal
  const openConfirmationModal = (msg: string, actionFn: () => void) => {
    setModalMessage(msg);
    setConfirmAction(() => actionFn); 
    setIsModalOpen(true);
  };

  // Function to close the confirmation modal
  const closeConfirmationModal = () => {
    setIsModalOpen(false);
    setModalMessage('');
    setConfirmAction(null);
  };

  // This function will be called when the modal confirms
  const executeDelete = async (eventId: string) => {
    closeConfirmationModal(); 
    setMessage('');
    setIsSuccess(false);

    try {
      const response = await fetch('/api/admin/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventId }),
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

  // Modified handleDelete to open the modal
  const handleDelete = (eventId: string) => {
    openConfirmationModal(
      'Êtes-vous sûr de vouloir supprimer cet événement ? Toutes les inscriptions associées seront également supprimées.',
      () => executeDelete(eventId)
    );
  };

  if (loading && action === 'list') {
    return <p className="text-center text-gray-600 text-lg">Chargement des événements...</p>;
  }

  return (
    <div className="p-3">

      {message && (
        <div className={`mb-4 text-center font-semibold p-3 rounded-lg ${isSuccess ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
          {message}
        </div>
      )}

      {(action === 'create' || action === 'edit') && (
        <form onSubmit={handleSubmit} className="max-w-5xl p-6 md:px-8 md:pb-10 xl:pb-12 rounded-2xl shadow-xl mx-auto bg-white sm:mb-15">
            <h2 className="text-3xl font-bold mb-6 sm:mb-10 text-gray-800 text-center">{action === 'create' ? 'Créer un événement' : action === 'edit' ? 'Modifier l\'événement' : 'Gérer les Événements'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
                <div className="relative group">
                    <input type="text" id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="peer block w-full px-3 pb-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0676bdff] hover:border-[#0676bdff] focus:border-[#0676bdff]" />
                    <label htmlFor="title" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 group-hover:text-[#0676bdff] peer-focus:text-[#0676bdff] px-1 py-0 ml-4 bg-white">Titre</label>
                </div>
                <div className="relative group">
                    <input type="datetime-local" id="event_date" name="event_date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required className="peer block w-full px-3 pb-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0676bdff] hover:border-[#0676bdff] focus:border-[#0676bdff]" />
                    <label htmlFor="event_date" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 group-hover:text-[#0676bdff] peer-focus:text-[#0676bdff] px-1 py-0 ml-4 bg-white">Date et heure</label>
                </div>
                <div className="relative group">
                    <input type="text" id="location" name="location" value={location} onChange={(e) => setLocation(e.target.value)} required className="peer block w-full px-3 pb-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0676bdff] hover:border-[#0676bdff] focus:border-[#0676bdff]" />
                    <label htmlFor="location" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 group-hover:text-[#0676bdff] peer-focus:text-[#0676bdff] px-1 py-0 ml-4 bg-white">Lieu</label>
                </div>
                <div className="relative group">
                    <input type="number" id="available_seats" name="available_seats" value={availableSeats} onChange={(e) => setAvailableSeats(Number(e.target.value))} required min="0" className="peer block w-full px-3 pb-2 pt-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0676bdff] hover:border-[#0676bdff] focus:border-[#0676bdff]" />
                    <label htmlFor="available_seats" className="absolute pointer-events-none top-0 -translate-y-1/2 text-sm font-medium text-gray-700 group-hover:text-[#0676bdff] peer-focus:text-[#0676bdff] px-1 py-0 ml-4 bg-white">Places disponibles</label>
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
                        className="peer mt-1 block w-full text-sm text-gray-500 rounded-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#F0EEE5] file:text-gray-700 hover:file:bg-[#E8E5D8] px-3 pb-2 pt-3 border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0676bdff] hover:border-[#0676bdff] focus:border-[#0676bdff]"
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
                <div className="flex flex-col sm:flex-row sm:justify-end gap-4 mt-4">
                    <button
                        type="button"
                        onClick={() => router.push('/admin/manage-events')} 
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
      )}

      {action === 'list' && (
        <>
          <div className="mb-6 text-center flex justify-end">
            <Link href="/admin/manage-events?action=create" className=" h-11 inline-flex items-center justify-center px-5 py-2 rounded-full text-base text-[#FFF] hover:text-gray-800 font-medium transition-colors border-[0.5px] border-transparent shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-gray-800 hover:bg-amber-50 hover:border-gray-800 cursor-pointer duration-300 ease-in-out group">
              <PlusIcon className="inline-block w-4 h-4 mr-2 group-hover:animate-bounce" />
              <span>Créer un événement</span>
            </Link>
          </div>

          {events.length === 0 ? (
            <p className="text-center text-gray-600 text-lg">Aucun événement à gérer pour le moment.</p>
          ) : (
            <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lieu</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Places Disp.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inscrits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.event_date).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.available_seats}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{event.registered_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                        <Link href={`/admin/manage-events?action=edit&id=${event.id}`} className="text-[#4A90E2] hover:text-indigo-900 border-1 rounded-full bg-white hover:bg-amber-50 px-4 pb-1 pt-1 shadow-lg h-7 flex items-center justify-center">
                          <PencilIcon className="w-4 h-4" /> Modifier
                        </Link>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="text-red-600 hover:text-red-900 border-1 rounded-full bg-white hover:bg-amber-50 px-2.5 pb-1 pt-0.5 shadow-lg h-7 flex items-center justify-center"
                        >
                          <TrashIcon className="w-4 h-4" /> Supprimer
                        </button>
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
        <Link href="/admin" className="h-11 inline-flex items-center justify-center px-5 py-2 rounded-full text-base text-[#FFF] hover:text-gray-800 font-medium transition-colors border-[0.5px] border-transparent shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-gray-800 hover:bg-[#FFF] hover:border-gray-800 cursor-pointer duration-300 ease-in-out group">
          <ArrowUpIcon className="inline-block w-4 h-4 mr-2 rotate-270 group-hover:animate-bounce" />
          <span>Tableau de bord</span>
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

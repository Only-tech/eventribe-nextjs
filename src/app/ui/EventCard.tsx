'use client'; 

import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline'; 

// Define the Event type if not already globally available or imported
interface Event {
    id: string;
    title: string;
    description_short: string;
    event_date: string;
    location: string;
    available_seats: number;
    image_url: string | null;
    registered_count: number;
}

interface EventCardProps {
    event: Event;
}

export default function EventCard({ event }: EventCardProps) {
    // Calculate remaining seats
    const remainingSeats = event.available_seats;

    function isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }


    const fallbackImageSrc = 'https://placehold.co/600x400.png?text=Image+non+disponible';

    // Use a more robust check for a valid image source
    const finalImageSrc = (event.image_url && isValidUrl(event.image_url)) ? event.image_url : fallbackImageSrc;
    
    return (
        <div className="max-w-md bg-[rgb(248,248,236)] dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden flex flex-col transform transition-all duration-300 hover:shadow-2xl dark:hover:shadow-[0px_2px_5px_rgba(255,_149,_42,_1)] dark:shadow-[0px_1px_5px_rgba(255,_255,_255,_0.4)] group" data-aos="fade-up">
        <div className="relative w-full h-56 overflow-hidden">
            <Image
            src={finalImageSrc}
            alt={`Image de l'événement ${event.title}`}
            fill
            style={{ objectFit: 'cover' }}
            className="w-full h-48 xl:h-80 object-cover rounded-t-lg group-hover:scale-110 transition duration-500 ease-in-out group-hover:rotate-1"
            />

        </div>
        <div className="p-3 sm:p-4 md:p-6 flex-grow flex flex-col">
            <h2 className="text-center text-lg md:text-xl font-bold text-gray-900 dark:text-[#ff952aff] mb-2">{event.title}</h2>
            <p className="text-gray-700 dark:text-gray-500 text-sm mb-2">
            <CalendarIcon className="inline-block w-4 h-4 mr-1" /> {new Date(event.event_date).toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })} GMT+2
            </p>
            <p className="text-gray-700 dark:text-gray-500 text-sm mb-4">
            <MapPinIcon className="inline-block w-4 h-4 mr-1" /> {event.location}
            </p>
            <p className="text-center sm:text-justify text-gray-700 dark:text-gray-400 mb-4 flex-grow">{event.description_short}</p>
            <div className="mt-auto flex flex-row   justify-between items-center gap-3">
                <p className="text-sm inline-flex items-center text-gray-500 whitespace-nowrap">
                <UsersIcon className="inline-block w-6 h-6 mr-1" /> {remainingSeats}
                </p>
                
                <Link href={`/event/${event.id}`} className=" h-11 inline-flex items-center justify-center px-5 py-2 rounded-full text-base font-medium transition-colors group border-[0.5px] dark:bg-zinc-900 dark:text-gray-300 dark:hover:text-gray-700 shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-[#F0EEE5] hover:bg-[#E8E5D8] hover:border-transparent">
                    <span className="whitespace-nowrap">En savoir plus</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="inline-block w-4 h-4  group-hover:animate-bounce ml-2">
                        <path d="M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z"></path>
                    </svg>
                </Link>
            </div>
        </div>
        </div>
    );
}

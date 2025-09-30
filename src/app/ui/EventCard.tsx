'use client'; 

import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, ChevronUpIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline'; 

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

    // Check for a valid image source
    const finalImageSrc = (event.image_url && isValidUrl(event.image_url)) ? event.image_url : fallbackImageSrc;
    
    return (
        <Link href={`/event/${event.id}`} className="max-w-75 bg-[rgb(248,248,236)] dark:bg-[#1E1E1E] rounded-3xl shadow-lg overflow-hidden flex flex-col transform transition-all duration-300 hover:shadow-2xl dark:hover:shadow-[0px_2px_5px_rgba(255,_149,_42,_1)] dark:shadow-[0px_1px_5px_rgba(255,_255,_255,_0.4)] group mx-auto" data-aos="fade-up">
            <div className="relative w-full h-40 overflow-hidden">
                <Image
                src={finalImageSrc}
                alt={`Image de l'événement ${event.title}`}
                title={event.title}
                fill
                style={{ objectFit: 'cover' }}
                className="w-full h-42 object-cover rounded-t-lg group-hover:scale-110 transition duration-500 ease-in-out group-hover:rotate-1"
                />

            </div>
            <div className="py-3 px-3.5 text-sm flex-grow flex flex-col">
                <h2 className="text-center md:text-base font-bold text-gray-900 dark:text-[#ff952aff] mb-2">{event.title}</h2>
                <p className="inline-flex items-center text-gray-700 dark:text-white/45 text-xs mb-1">
                <CalendarIcon className="inline-block w-4 h-4 mr-1" /> {new Date(event.event_date).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })} GMT+2
                </p>
                <p className="inline-flex items-center text-gray-700 dark:text-white/45 text-sm mb-3">
                <MapPinIcon className="inline-block w-4 h-4 mr-1" /> {event.location}
                </p>
                <p className="text-gray-700 dark:text-white/65 mb-3 flex-grow">{event.description_short}</p>
                <div className="mt-auto flex flex-row   justify-between items-center gap-3">
                    <p className="text-sm inline-flex items-center text-[#08568a] whitespace-nowrap">
                    <UsersIcon className="inline-block size-5 mr-1" /> {remainingSeats}
                    </p>
                    
                    <p className=" h-8 inline-flex items-center justify-center pl-4 p-1 rounded-full font-medium transition-colors group border-[0.1px] dark:border-white/30 dark:bg-[#1E1E1E] dark:text-white/65 dark:group-hover:text-gray-700 shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-[#F0EEE5] group-hover:bg-[#E8E5D8] group-hover:border-transparent">
                        <span className="whitespace-nowrap">En savoir plus</span>
                        <ChevronUpIcon className="inline-block w-4 h-4 ml-2 rotate-90 group-hover:animate-bounce"/>
                    </p>
                </div>
            </div>
        </Link>
    );
}

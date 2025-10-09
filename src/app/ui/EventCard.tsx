'use client'; 

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Event } from '@/app/lib/definitions';
import { UsersIcon } from '@heroicons/react/24/outline'; 
import { MapPinIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import { ChevronUpIcon, UserPlusIcon } from '@heroicons/react/16/solid'; 
import ActionButton from '@/app/ui/buttons/ActionButton';


export default function EventCard({ event }: { event: Event; }) {

    const router = useRouter();

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
        <Link
            href={`/event/${event.id}`} className="max-w-75 bg-[#FCFFF7] hover:bg-white dark:bg-[#1E1E1E] dark:hover:bg-[#1E1E1E] rounded-3xl shadow-[0_10px_15px_rgb(0,0,0,0.2)] overflow-hidden flex flex-col hover:scale-106 xl:hover:scale-110 transition-transform duration-2000 ease-in-out group mx-auto relative hover:-translate-y-1.5 hover:z-10 hover:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:shadow-[0_12px_15px_rgb(0,0,0,0.6)] dark:hover:shadow-[0_12px_15px_rgb(0,0,0,0.8)]" data-aos="fade-up"
        >
            <div className="relative w-full h-40 overflow-hidden">
                <Image
                    src={finalImageSrc}
                    alt={`Image de l'événement ${event.title}`}
                    title={event.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="w-full h-42 object-cover rounded-t-lg transition-transform duration-500 ease-in-out group-hover:scale-110 group-hover:rotate-1"
                />
            </div>

            <div className="py-3 px-3.5 text-sm flex-grow flex flex-col">
                <h2 className="text-center md:text-base font-bold text-gray-900 dark:text-[#ff952aff] mb-2">{event.title}</h2>

                <p className="inline-flex items-center text-gray-700 dark:text-white/45 text-xs mb-1">
                    <CalendarDaysIcon className="inline-block w-4 h-4 mr-1" />
                    {new Date(event.event_date).toLocaleString('fr-FR', {
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

                <div className="mt-auto flex justify-between items-center">
                <div className="relative flex items-center gap-2">
                    <p title="Places disponibles" className="text-sm inline-flex items-center text-[#08568a] whitespace-nowrap">
                        <UsersIcon className="inline-block size-5 mr-1" /> {event.available_seats}
                    </p>
                    <span title="Abonné(e)s" className="absolute left-full whitespace-nowrap ml-6 text-xs text-gray-500 dark:text-white/45 opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                        <UserPlusIcon className="inline-block size-5 mr-1" />{event.registered_count}
                    </span>
                </div>

                <ActionButton
                    variant="secondary"
                    onClick={() => router.push(`/event/${event.id}`)}
                    className="h-8 pl-4 pr-[4px!important] dark:bg-transparent dark:text-white/65 dark:hover:text-gray-800 dark:border-white/30 group-hover:border-transparent group-hover:text-gray-800 group-hover:bg-[#E8E5D8]"
                >
                    <span className="text-sm whitespace-nowrap">En savoir plus</span>
                    <ChevronUpIcon className="inline-block size-6 ml-2 rotate-90 group-hover:animate-bounce" />
                </ActionButton>
                </div>
            </div>
        </Link>

    );
}

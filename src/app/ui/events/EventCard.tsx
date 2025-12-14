'use client'; 

import Image from 'next/image';
import Link from 'next/link';
import { Event } from '@/app/lib/definitions';
import { UsersIcon } from '@heroicons/react/24/outline'; 
import { MapPinIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import { ChevronUpIcon, UserPlusIcon } from '@heroicons/react/16/solid'; 


export default function EventCard({ event }: { event: Event; }) {

    function isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }


    const fallbackImageSrc = 'https://placehold.co/600x400.png?text=Image+non+disponible';

    const finalImageSrc = (event.image_url && isValidUrl(event.image_url)) ? event.image_url : fallbackImageSrc;
    
    return (
        <div data-aos="fade-up">
            <Link 
                href={`/event/${event.id}`} 
                className="w-[95%] max-sm:max-w-md sm:w-78 h-104 sm:h-94 bg-[#FCFFF7] hover:bg-white dark:bg-[#1E1E1E] dark:hover:bg-[#1E1E1E] rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col translate-y-0 scale-100 transform
                    transition-transform duration-600 ease-in-out
                    hover:-translate-y-1.5 hover:scale-104 xl:hover:scale-106 hover:z-10
                    mx-auto relative shadow-[0_10px_15px_rgb(0,0,0,0.2)]
                    hover:shadow-[0_12px_15px_rgb(0,0,0,0.3)]
                    dark:shadow-[0_12px_15px_rgb(0,0,0,0.6)]
                    dark:hover:shadow-[0_12px_15px_rgb(0,0,0,0.8)] group will-change-transform isolate border border-gray-300 dark:border-white/10
                "
            >
                <div className="relative w-full h-50 sm:h-40 overflow-hidden">
                    <Image
                        src={finalImageSrc}
                        alt={`Image de l'événement ${event.title}`}
                        title={event.title}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="w-full h-50 sm:h-42 object-cover rounded-t-lg transition-transform duration-500 ease-in-out will-change-transform group-hover:scale-110 group-hover:rotate-1 "
                    />
                </div>

                <section className="py-3 px-3.5 text-sm grow flex flex-col">
                    <h5 className="text-center text-lg sm:text-base font-bold text-gray-900 dark:text-[#ff952aff] mb-2">{event.title}</h5>

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

                    <p className="text-gray-700 text-justify dark:text-white/65 mb-3 grow">{event.description_short}</p>

                    <div className="mt-auto flex justify-between items-center">
                        <p className="relative flex items-center gap-1.5">
                            <span title="Places disponibles" className="text-sm inline-flex items-center text-[#08568a] whitespace-nowrap">
                                <UsersIcon className="inline-block size-5 mr-1" /> {event.available_seats}
                            </span>
                            <span title="Abonné(e)s" className="absolute left-full whitespace-nowrap ml-5 text-xs text-gray-500 dark:text-white/45 opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                                <UserPlusIcon className="inline-block size-5 mr-1" />{event.registered_count}
                            </span>
                        </p>

                        <p className="inline-flex items-center h-8 pl-3 pr-0.5 rounded-full dark:bg-transparent dark:text-white/65 dark:hover:text-gray-800 border border-gray-400 dark:border-white/10 group-hover:border-transparent group-hover:text-gray-800 group-hover:bg-[#E8E5D8] transition-all drop-shadow-[0px_5px_5px_rgba(0,0,0,0.2)] shadow-[hsl(var(--always-black)/5.1%)] duration-500 ease-in-out">
                            <span className="text-sm whitespace-nowrap -translate-y-px">En savoir plus</span>
                            <ChevronUpIcon className="inline-block size-6 rotate-90 group-hover:animate-bounce" />
                        </p>
                    </div>
                </section>
            </Link>
        </div>
    );
}

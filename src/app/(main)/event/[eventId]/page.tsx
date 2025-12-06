import { notFound } from 'next/navigation';
import { fetchEventById, isUserRegisteredForEvent } from '@/app/lib/data-access/events';
import Image from 'next/image';
import { BanknotesIcon, UsersIcon } from '@heroicons/react/24/outline';
import { MapPinIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import { UserGroupIcon } from '@heroicons/react/16/solid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import { Event } from '@/app/lib/definitions';
import EventDetailsClient from './EventDetailsClient';
import { Suspense } from 'react';
import Loader from '@/app/ui/animation/Loader'


async function EventDetails({ eventId }: { eventId: number }) {
    const event: Event | null = await fetchEventById(eventId);
    const session = await getServerSession(authOptions);

    if (!event) {
        notFound();
    }

    const imageUrl = event.image_url
        ? `/${event.image_url.replace(/^(\.\.\/|\/)?(public\/)?/, '')}`
        : 'https://placehold.co/600x400.png?text=Image+non+disponible';

    const isLoggedIn = !!session;
    const sessionUserId = session?.user?.id;

    const userId = sessionUserId && !isNaN(Number(sessionUserId)) 
        ? Number(sessionUserId) 
        : undefined;

    const isRegistered = isLoggedIn && userId !== undefined ? await isUserRegisteredForEvent(Number(userId), eventId) : false;

    return (
        <div className="min-[769px]:drop-shadow-[0_10px_15px_rgb(0,0,0,0.3)] max-w-7xl xl:max-w-360 min-[769px]:w-[95%] mx-auto transform transition-transform duration-300 min-[769px]:hover:drop-shadow-2xl group min-[769px]:dark:hover:drop-shadow-[0px_1px_1px_rgba(255,_255,_255,_0.4)] min-[769px]:dark:drop-shadow-[0px_15px_15px_rgba(0,0,0,_0.6)]">
            <div className="max-[769px]:-mt-6.5 max-[769px]:-mb-30 max-[769px]:min-h-screen px-5 py-8 bg-[#FCFFF7] dark:bg-[#1E1E1E] dark:text-white/95 md:px-10 items-center min-[769px]:[clip-path:var(--clip-path-squircle-60)]">
                <section className="min-[1025px]:flex">
                    <h1 className="min-[1025px]:hidden text-3xl md:text-4xl text-center min-[1025px]:text-start font-extrabold text-gray-900 dark:text-white mb-4">{event.title}</h1>

                    <div className="relative  w-full min-[1025px]:min-w-sm min-[1025px]:max-w-md xl:max-w-xl h-55 sm:h-80 xl:h-96 mb-6 rounded-xl md:rounded-4xl shadow-xl overflow-hidden">
                        <Image
                            src={imageUrl.startsWith('/https://') ? imageUrl.slice(1) : imageUrl}
                            alt={`${event.title}`}
                            fill
                            style={{ objectFit: 'cover' }}
                            className="w-full h-full group-hover:scale-110 transition duration-500 ease-in-out group-hover:rotate-1"
                        />
                    </div>

                    <div className="flex flex-col flex-1 text-sm min-[1025px]:justify-center min-[1025px]:pl-6 mb-6">
                        <h1 className="hidden min-[1025px]:flex text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-300 mb-4">{event.title}</h1>
                        <p className="flex-wrap max-[1025px]:mt-3">
                            <span className="inline-flex items-center text-gray-700 dark:text-white/70 mb-2 mr-10">
                                <CalendarDaysIcon className="inline-block w-5 h-5 mr-2" />{' '}
                                {new Date(event.event_date).toLocaleString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}{' '}
                                GMT+2
                            </span>
                            <span className="inline-flex items-center text-gray-700 dark:text-white/70 mb-2">
                                <MapPinIcon className="inline-block w-5 h-5 mr-2" /> {event.location}
                            </span>
                        </p>
                        <p className="inline-flex items-center text-gray-700 dark:text-white/70 mb-2">
                            <UsersIcon className="inline-block w-6 h-6 mr-2" />{event.registered_count}
                            <UserGroupIcon className="size-8 ml-8"/><strong className="text-gray-800 dark:text-gray-300 ml-2">Places disponibles &nbsp; </strong>&nbsp;  {event.available_seats}
                        </p>
                        <p className="inline-flex items-center text-gray-700 dark:text-white/70 mb-5">
                            <BanknotesIcon className="size-8 mr-3"/>
                            <strong>Pass </strong> &nbsp;&nbsp; {event.price > 0 ? `${event.price} €` : "Gratuit"}
                        </p>
                    
                        <p className="text-justify text-gray-700 dark:text-white/70 leading-relaxed whitespace-pre-line">
                            {event.description_long}
                        </p>
                    </div>
                </section>

                <EventDetailsClient
                    event={event}
                    userId={userId}
                    isRegistered={isRegistered}
                    isLoggedIn={isLoggedIn}
                />
            </div>
        </div>
    );
}


export default async function EventDetailPage({ params }: {
    params: Promise<{ eventId: number }>;
}) {
    const { eventId } = await params;
    const id = Number(eventId);

    return (
        <Suspense 
            fallback={
                <>
                    <div className="text-center p-6">Chargement des détails de l&apos;événement</div>
                    <Loader variant="dots" />
                </>
            }
        >
            <EventDetails eventId={id} />
        </Suspense>
    );
}
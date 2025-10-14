import { notFound } from 'next/navigation';
import { fetchEventById, isUserRegisteredForEvent } from '@/app/lib/data-access/events';
import Image from 'next/image';
import Link from 'next/link';
import { UsersIcon } from '@heroicons/react/24/outline';
import { MapPinIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import { ChevronUpIcon, UserGroupIcon } from '@heroicons/react/16/solid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth/options';
import { Event } from '@/app/lib/definitions';
import EventDetailsClient from './EventDetailsClient';
import ActionButton from '@/app/ui/buttons/ActionButton';
import { Suspense } from 'react';
import Loader from '@/app/ui/Loader'


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
    <div className="min-[500px]:drop-shadow-[0_10px_15px_rgb(0,0,0,0.3)] max-w-7xl xl:max-w-400 min-[500px]:w-[95%] mx-auto transform transition-transform duration-300 min-[500px]:hover:drop-shadow-2xl group min-[500px]:dark:hover:drop-shadow-[0px_1px_1px_rgba(255,_255,_255,_0.4)] min-[500px]:dark:drop-shadow-[0px_15px_15px_rgba(0,0,0,_0.6)]">
      <div className=" px-5 py-8 bg-[#FCFFF7] dark:bg-[#1E1E1E] dark:text-white/95 md:p-8 items-center min-[500px]:[clip-path:var(--clip-path-squircle-60)]">
        <div className="lg:flex">
          <h1 className="lg:hidden text-3xl md:text-4xl text-center lg:text-start font-extrabold text-gray-900 dark:text-white mb-4">{event.title}</h1>

          <div className="relative flex-1 w-full lg:min-w-sm lg:max-w-md xl:max-w-xl h-55 sm:h-80 xl:h-96 mb-6 rounded-xl md:rounded-4xl shadow-2xl overflow-hidden">
            <Image
              src={imageUrl.startsWith('/https://') ? imageUrl.slice(1) : imageUrl}
              alt={`${event.title}`}
              fill
              style={{ objectFit: 'cover' }}
              className="w-full h-full group-hover:scale-110 transition duration-500 ease-in-out group-hover:rotate-1"
            />
          </div>

          <div className="flex flex-col flex-1 md:flex-row lg:flex-col lg:justify-center lg:pl-6 gap-6 mb-6">
            <div className="min-w-[330px] flex flex-col text-sm">
              <h1 className="hidden lg:flex text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-300 mb-4">{event.title}</h1>
              <p className="inline-flex items-center text-gray-700 dark:text-white/70 mb-2">
                <CalendarDaysIcon className="inline-block w-5 h-5 mr-2" />{' '}
                {new Date(event.event_date).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                GMT+2
              </p>
              <p className="inline-flex items-center text-gray-700 dark:text-white/70 mb-2">
                <MapPinIcon className="inline-block w-5 h-5 mr-2" /> {event.location}
              </p>
              <p className="inline-flex items-center text-gray-700 dark:text-white/70 mb-2">
                <UsersIcon className="inline-block w-6 h-6 mr-2" />{event.registered_count}
                <UserGroupIcon className="size-8 ml-8"/><strong className="text-gray-800 dark:text-gray-300 ml-2">Places disponibles &nbsp;: </strong>&nbsp;  {event.available_seats}
              </p>
            </div>
            <div>
              <p className="text-justify text-gray-700 dark:text-white/70 leading-relaxed whitespace-pre-line">
                {event.description_long}
              </p>
            </div>
          </div>
        </div>

        <EventDetailsClient
          event={event}
          userId={userId}
          isRegistered={isRegistered}
          isLoggedIn={isLoggedIn}
        />
      </div>
      <Link href="/events" className="absolute -mt-6 ml-15">
          <ActionButton variant="secondary">
              <ChevronUpIcon className="inline-block size-6 mr-2 rotate-[-90deg] group-hover:animate-bounce" />
              <span>Page d&apos;accueil</span>
          </ActionButton>
      </Link>
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
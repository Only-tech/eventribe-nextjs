import { notFound } from 'next/navigation';
import { fetchEventById, isUserRegisteredForEvent } from '@/app/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, MapPinIcon, PlusIcon, ArrowUpIcon, UsersIcon } from '@heroicons/react/24/outline';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { registerAction, unregisterAction } from '@/app/lib/actions';
import { Event } from '@/app/lib/definitions';


export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const id = Number(eventId);

  const event: Event | null = await fetchEventById(id);
  const session = await getServerSession(authOptions);

  if (!event) {
    notFound();
  }

  const imageUrl = event.image_url
    ? `/${event.image_url.replace(/^(\.\.\/|\/)?(public\/)?/, '')}`
    : 'https://placehold.co/600x400.png?text=Image+non+disponible';

  const remainingSeats = event.available_seats;
  const isLoggedIn = !!session;
  const userId = session?.user?.id;
  const isRegistered = isLoggedIn && userId ? await isUserRegisteredForEvent(userId, id) : false;

  return (
    <div className=" px-3 py-8 bg-[rgb(248,248,236)] dark:bg-zinc-900 dark:text-white/95 rounded-lg lg:rounded-2xl shadow-lg md:p-8 max-w-7xl mx-auto items-center transform transition-transform duration-300 hover:shadow-2xl group">
    <div className="lg:flex">  
      <h1 className="lg:hidden text-3xl md:text-4xl text-center lg:text-start font-extrabold text-gray-900 dark:text-white mb-4">{event.title}</h1>

      <div className="relative w-full lg:min-w-sm lg:max-w-md h-55 sm:h-96 mb-6 rounded-lg overflow-hidden">
        <Image
          src={imageUrl.startsWith('/https://') ? imageUrl.slice(1) : imageUrl}
          alt={`${event.title}`}
          fill
          style={{ objectFit: 'cover' }}
          className="w-full h-full group-hover:scale-110 transition duration-500 ease-in-out group-hover:rotate-1"
        />
      </div>

      <div className="flex flex-col md:flex-row lg:flex-col lg:justify-center lg:pl-6 gap-6 mb-6">
        <div className="min-w-[330px]">
          <h1 className="hidden lg:flex text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">{event.title}</h1>
          <p className="text-gray-700 dark:text-gray-400 text-lg mb-2">
            <CalendarIcon className="inline-block w-5 h-5 mr-1" />{' '}
            {new Date(event.event_date).toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            GMT+2
          </p>
          <p className="text-gray-700 dark:text-gray-400 text-lg mb-2">
            <MapPinIcon className="inline-block w-5 h-5 mr-1" /> {event.location}
          </p>
          <p className="text-gray-700 dark:text-gray-400 text-lg mb-2">
            <UsersIcon className="inline-block w-6 h-6 mr-2" />
            <strong className="text-gray-800 dark:text-white">Places disponibles :</strong> {remainingSeats}
          </p>
        </div>
        <div>
          <p className="text-justify text-gray-700 dark:text-gray-400 leading-relaxed whitespace-pre-line">
            {event.description_long}
          </p>
        </div>
      </div>
    </div>

      <div className="mt-8 lg:mt-2 mb-2 lg:mb-0 flex justify-center">
        {isLoggedIn && userId ? (
          isRegistered ? (
            <form action={unregisterAction.bind(null, userId, id)}>
              <button
                type="submit"
                className="px-5 py-2 rounded-full text-base text-[#FFF] hover:text-[#ff952aff] font-medium transition-colors group border-[0.5px] border-transparent shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-gray-800 hover:bg-[#FFF] hover:border-[#ff952aff] cursor-pointer duration-300 ease-in-out"
              >
                Se désinscrire
              </button>
            </form>
          ) : remainingSeats > 0 ? (
            <form action={registerAction.bind(null, userId, id)}>
              <button
                type="submit"
                className="h-11 inline-flex items-center justify-center px-5 py-2 mb-8 rounded-full text-base font-medium transition-colors group border-[0.5px] dark:text-zinc-600 shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-[#F0EEE5] hover:bg-[#E8E5D8] hover:border-transparent duration-300 ease-in-out cursor-pointer"
              >
                <span>S&apos;inscrire</span>
                <PlusIcon className="inline-block w-4 h-4 group-hover:animate-bounce ml-2" />
              </button>
            </form>
          ) : (
            <p className="text-red-600 font-bold text-lg rounded-lg p-3 bg-red-100">Complet !</p>
          )
        ) : (
          <p className="text-gray-700 dark:text-gray-500">
            <Link href="/login" className="text-indigo-600 hover:underline">
              Connectez-vous
            </Link>{' '}
            pour vous inscrire à cet événement.
          </p>
        )}
      </div>

      <Link
        href="/events"
        className="absolute h-11 inline-flex items-center justify-center mt-3 px-5 py-2 rounded-full text-base text-[#FFF] hover:text-[#ff952aff] font-medium transition-colors group border-[0.5px] border-transparent shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-gray-800 hover:bg-[#FFF] hover:border-[#ff952aff] cursor-pointer duration-300 ease-in-out"
      >
        <ArrowUpIcon className="inline-block w-4 h-4 mr-2 rotate-270 group-hover:animate-bounce" />
        <span>Page d&apos;accueil</span>
      </Link>
    </div>
  );
}

import { notFound } from 'next/navigation';
import { fetchEventById, isUserRegisteredForEvent } from '@/app/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarIcon, MapPinIcon, ArrowUpIcon, UsersIcon } from '@heroicons/react/24/outline';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import RegisterButton from '@/app/ui/RegisterButton';
import UnregisterButton from '@/app/ui/UnregisterButton';
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
    <div className="drop-shadow-lg max-w-7xl xl:max-w-400 mx-auto transform transition-transform duration-300 hover:drop-shadow-2xl group dark:hover:drop-shadow-[0px_1px_5px_rgba(255,_255,_255,_0.4)] dark:drop-shadow-[0px_1px_1px_rgba(255,_255,_255,_0.2)]">
    <div className=" px-3 py-8 bg-[rgb(248,248,236)] dark:bg-[#1E1E1E] dark:text-white/95 rounded-lg lg:rounded-2xl shadow-lg md:p-8 items-center" style={{ clipPath: "var(--clip-path-squircle-60)" }}>
    <div className="lg:flex">  
      <h1 className="lg:hidden text-3xl md:text-4xl text-center lg:text-start font-extrabold text-gray-900 dark:text-white mb-4">{event.title}</h1>

      <div className="relative w-full lg:min-w-sm lg:max-w-md xl:max-w-xl h-55 sm:h-96 mb-6 rounded-4xl shadow-2xl overflow-hidden">
        <Image
          src={imageUrl.startsWith('/https://') ? imageUrl.slice(1) : imageUrl}
          alt={`${event.title}`}
          fill
          style={{ objectFit: 'cover' }}
          className="w-full h-full group-hover:scale-110 transition duration-500 ease-in-out group-hover:rotate-1"
        />
      </div>

      <div className="flex flex-col md:flex-row lg:flex-col lg:justify-center lg:pl-6 gap-6 mb-6">
        <div className="min-w-[330px] flex flex-col text-sm">
          <h1 className="hidden lg:flex text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-300 mb-4">{event.title}</h1>
          <p className="inline-flex items-center text-gray-700 dark:text-gray-400 mb-2">
            <CalendarIcon className="inline-block w-5 h-5 mr-2" />{' '}
            {new Date(event.event_date).toLocaleString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            GMT+2
          </p>
          <p className="inline-flex items-center text-gray-700 dark:text-gray-400 mb-2">
            <MapPinIcon className="inline-block w-5 h-5 mr-2" /> {event.location}
          </p>
          <p className="inline-flex items-center text-gray-700 dark:text-gray-400 mb-2">
            <UsersIcon className="inline-block w-6 h-6 mr-2" />
            <strong className="text-gray-800 dark:text-gray-300">Places disponibles &nbsp;: </strong>&nbsp; {remainingSeats}
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
            <UnregisterButton userId={userId} eventId={id} />
          ) : remainingSeats > 0 ? (
            <RegisterButton userId={userId} eventId={id} />
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

    </div>
    <div className="relative">
      <Link
        href="/events"
        className="absolute h-11 inline-flex items-center justify-center -mt-6 ml-10 px-5 py-2 rounded-full text-base text-[#FFF] hover:text-[#ff952aff] font-medium transition-colors group border-[0.5px] border-transparent shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-gray-800 hover:bg-[#FFF] hover:border-[#ff952aff] cursor-pointer duration-300 ease-in-out"
      >
        <ArrowUpIcon className="inline-block w-4 h-4 mr-2 rotate-270 group-hover:animate-bounce" />
        <span>Page d&apos;accueil</span>
      </Link>
    </div>
    </div>
  );
}

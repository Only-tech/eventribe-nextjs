import EventCard from '@/app/ui/EventCard';
import { fetchEvents } from '@/app/lib/data';
import { Event } from '@/app/lib/definitions';
import Carousel from '@/app/ui/Carousel';


// The home page is an asynchronous component that retrieves and displays events.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query } = await searchParams;
  const events = await fetchEvents(query ?? '');

  const imageUrls = events
    .filter((event) => typeof event.image_url === 'string' && event.image_url !== null)
    .map((event) => ({
      url: event.image_url as string,
      eventId: Number(event.id), 
      alt: `Image de l'événement ${event.title}`,
  }));

 

  return (
    <main>
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-15 text-center">
        {query ? `Résultats de recherche pour "${query}"` : 'Découvrez les événements à venir'}
      </h1>

      {events.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          Aucun événement n&apos;est disponible pour le moment. Revenez plus tard !
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(360px,1fr))] gap-8 xl:gap-12 mx-auto w-full">
          {events.map((event: Event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      <div className="mt-20">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-5 border-b-1 pb-2">
          Les intemporels
        </h1>
        <Carousel imageUrls={imageUrls} />
      </div>
    </main>
  );
}

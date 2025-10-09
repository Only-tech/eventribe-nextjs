import EventCard from '@/app/ui/EventCard';
import { fetchEvents } from '@/app/lib/data';
import { Event } from '@/app/lib/definitions';
import BannerCarousel from '@/app/ui/BannerCarousel'; 
import Carousel from '@/app/ui/Carousel';


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
      title: `${event.title}`,
  }));

  return (
    <>
      {!query && <BannerCarousel />}
      
      <div className=" max-w-[96%] mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-[#ff952aff] mb-15 text-center">
          {query ? `Résultats de recherche pour "${query}"` : 'Découvrez les événements à venir'}
        </h1>

        {events.length === 0 ? (
          <p className="text-center text-gray-700 dark:text-gray-500 text-lg">
            Aucun événement n&apos;est disponible pour le moment. Revenez plus tard !
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(275px,1fr))] gap-8 xl:gap-12 w-full">
            {events.map((event: Event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {!query && <h1 className="mt-20 text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-[#ff952aff] mb-5 relative inline-block after:content-[''] after:block after:h-1 after:bg-[#08568a] after:w-[70%] after:mt-1 after:left-0 after:relative pb-2">
              Les intemporels
            </h1>}
      </div>
      
      {!query && <Carousel imageUrls={imageUrls} />}
      
    </>
  );
}
import EventCard from '@/app/ui/EventCard';
import { fetchEvents } from '@/app/lib/data';
import { Event } from '@/app/lib/definitions';

// The home page is an asynchronous component that retrieves and displays events.
export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
  };
}) {
  // const query = searchParams?.query || '';
  const params = await searchParams;
  const query = params?.query ?? '';
  const events = await fetchEvents(query);

  return (
    <main>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-15 text-center">
        {query ? `Résultats de recherche pour "${query}"` : 'Découvrez les événements à venir'}
      </h1>

      {events.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          Aucun événement n&apos;est disponible pour le moment. Revenez plus tard !
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event: Event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </main>
  );
}

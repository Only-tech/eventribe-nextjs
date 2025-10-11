'use client'

import { useState, useEffect,useMemo  } from 'react';
import EventCard from '@/app/ui/EventCard';
import { fetchEvents } from '@/app/lib/data-access/events';
import { Event } from '@/app/lib/definitions';
import BannerCarousel from '@/app/ui/BannerCarousel'; 
import Carousel from '@/app/ui/Carousel';
import ActionButton from '@/app/ui/buttons/ActionButton';
import { ChevronDownIcon } from '@heroicons/react/16/solid';

const ROWS_TO_SHOW = 2;

const getColumnsCount = (width: number): number => {
    if (width >= 2080) { 
        return 6; // Cards count estimation in row from minmax(280px, 1fr)
    }
    if (width >= 1600) { 
        return 5; 
    }
    if (width >= 1360) { 
        return 4;
    }
    if (width >= 1024) { 
        return 3;
    }
    if (width >= 640) { 
        return 2;
    }
    // Mobile (- 640px)
    return 1;
};

export default function EventsPage() {

    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [columnsCount, setColumnsCount] = useState(
        // Init client side
        typeof window !== 'undefined' ? getColumnsCount(window.innerWidth) : 1
    );

    const eventsPerIncrement = columnsCount * ROWS_TO_SHOW;
    const [visibleCount, setVisibleCount] = useState(eventsPerIncrement);

    useEffect(() => {
        const handleResize = () => {
            const newColumnsCount = getColumnsCount(window.innerWidth);
            setColumnsCount(newColumnsCount);
            
            setVisibleCount(newColumnsCount * ROWS_TO_SHOW);
        };

        window.addEventListener('resize', handleResize);
        // Init client side
        handleResize(); 

        return () => window.removeEventListener('resize', handleResize);
    }, []); 

    // Fetch events only once
    useEffect(() => {
        setIsLoading(true);
        const loadEvents = async () => {
            const fetchedEvents = await fetchEvents('');
            setEvents(fetchedEvents);
            setIsLoading(false);
        };
        loadEvents();
    }, []);

    // Reset visibleCount whenever columnsCount changes
    useEffect(() => {
        setVisibleCount(columnsCount * ROWS_TO_SHOW);
    }, [columnsCount]);
 

    const loadMoreEvents = () => {
        setVisibleCount(prevCount => Math.min(prevCount + eventsPerIncrement, events.length));
    }

    // ====== Carrousel=======
    const imageUrls = useMemo(() => events
        .filter((event) => typeof event.image_url === 'string' && event.image_url !== null)
        .map((event) => ({
        url: event.image_url as string,
        eventId: Number(event.id), 
        alt: `Image de l'événement ${event.title}`,
        title: `${event.title}`,
    })), [events]);

    const eventsToDisplay = events.slice(0, visibleCount);
    const hasMoreEvents = events.length > visibleCount;

    return (
        <>
        <BannerCarousel />
        
        <div className="max-w-[96%] mx-auto">
            <div className="text-center my-10 md:my-15">
                <h1 className="max-sm:w-3xs text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-[#ff952aff] relative inline-block pb-2 after:content-[''] after:block after:h-1 after:bg-[#08568a] after:w-[60%] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2">
                    Découvrez les événements à venir
                </h1>
            </div>
            
            {isLoading ? (
                <p className="text-center text-gray-700 dark:text-gray-500 text-lg">Chargement des événements...</p>
            ) : events.length === 0 ? (
                <p className="text-center text-gray-700 dark:text-gray-500 text-lg">
                    Aucun événement n&apos;est disponible pour le moment. Revenez plus tard !
                </p>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(290px,1fr))] gap-8 md:gap-10 xl:gap-12 min-[1600px]:gap-20 w-full">
                        {eventsToDisplay.map((event: Event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>

                    {hasMoreEvents && (
                        <div className="text-center mt-12">
                            <ActionButton
                                variant="primary"
                                onClick={loadMoreEvents} 
                                className="dark:hover:text-gray-200 dark:text-gray-800 dark:hover:bg-gray-800 dark:bg-amber-50"
                            >
                                Afficher {Math.min(eventsPerIncrement, events.length - visibleCount)} événements de plus
                                <ChevronDownIcon className="ml-2 size-6"/>
                            </ActionButton>
                        </div>
                    )}
                </>
            )}

            <h1 className="mt-20 text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-[#ff952aff] mb-5 relative inline-block after:content-[''] after:block after:h-1 after:bg-[#08568a] after:w-[70%] after:mt-1 after:left-0 after:relative pb-2">
                Les intemporels
            </h1>
        </div>
        
        <Carousel imageUrls={imageUrls} />
        
        </>
    );
}
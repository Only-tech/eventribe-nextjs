import { forwardRef } from 'react';
import { Event } from '@/app/lib/definitions';
import Link from 'next/link';
import Image from 'next/image';
import { UsersIcon } from '@heroicons/react/24/solid';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import IconButton from '@/app/ui/buttons/IconButton';
import { XMarkIcon } from '@heroicons/react/16/solid';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import type { OverlayScrollbarsComponentRef } from 'overlayscrollbars-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';

interface SearchResultsProps {
    results: Event[];
    isLoading: boolean;
    onClose: () => void;
}

const SearchResults = forwardRef<OverlayScrollbarsComponentRef, SearchResultsProps>(
  ({ results, isLoading, onClose }, ref) => {
    return (
        <OverlayScrollbarsComponent
            ref={ref}
            options={{
                scrollbars: {
                    autoHide: 'scroll',
                    autoHideDelay: 500,
                },
            }}
            defer 
            className="fixed top-20 left-0 w-full z-100000 bg-[#FCFFF7] dark:bg-[#222] border-b-2 border-[#08568a] dark:border-[#ff952aff] max-h-[85vh] rounded-b-2xl"
        >
            <div className="container mx-auto p-4 max-w-full">

                <>
                {isLoading ? (
                    <p className="text-center text-gray-700 dark:text-gray-300 py-8">Recherche en cours <span className="animate-pulse">...</span></p>
                ) : results.length > 0 ? (
                    // Search Results Container
                    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 xl:gap-12 w-full justify-items-center">
                    {results.map((event) => (
                        <Link
                            href={`/event/${event.id}`}
                            key={event.id}
                            className="relative w-67 h-45 rounded-xl overflow-hidden border border-gray-300/20 hover:border-[#08568a] dark:hover:border-[#ff952a] shadow-[0_10px_15px_rgb(0,0,0,0.4)] hover:shadow-[0_10px_15px_rgb(8,86,138,0.8)] dark:hover:shadow-[0_15px_20px_rgb(0,0,0,0.8)] bg-gray-500 group transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-105"
                        >
                            <Image
                                src={event.image_url || 'https://placehold.co/280x180.png?text=Event'}
                                alt={`Affiche de ${event.title}`}
                                fill
                                className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
                            />

                            <div className="absolute inset-0 flex flex-col justify-end group-hover:bg-gradient-to-t from-black/80 via-black/50 to-transparent
                                            text-white">
                                
                                <div className="w-full bg-black/35  backdrop-blur-xs group-hover:backdrop-blur-sm pt-0.5 pb-2 px-2.5 transition-transform duration-300 ease-in-out transform shadow-xl rounded-xl">
                                    <h3 className="text-base font-semibold leading-tight truncate">
                                        {event.title}
                                    </h3>
                                    <p className="flex items-center justify-between text-xs text-white mt-1.5">
                                        <span className="flex items-center gap-1">
                                        <CalendarDaysIcon className="inline-block w-4 h-4 mr-1" />
                                            {new Date(event.event_date).toLocaleDateString('fr-FR', {
                                                day: '2-digit', month: '2-digit', year: 'numeric'
                                            })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <UsersIcon className="w-4 h-4" />
                                            {event.available_seats}
                                        </span>
                                    </p>
                                    <p className=" bottom-0 left-0 right-0 text-xs text-white mt-1.5 opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 transition-all duration-300 ease-in-out ">
                                        {event.description_short || "Aucune description courte disponible."}
                                    </p>
                                </div>
                                
                            </div>
                        </Link>
                    ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-700 dark:text-gray-300 py-8">Aucun événement trouvé.</p>
                )}
                </>
            </div>
            <div className="relative text-center m-2">
                <IconButton
                    type="button"
                    onClick={onClose}
                    className=" text-gray-500 hover:text-[#0088aa] dark:hover:text-[#ff952aff] bg-transparent hover:bg-gray-200 group"
                    aria-label="Fermer les résultats de recherche"
                    title="Fermer les résultats de recherche"
                >
                    <XMarkIcon className="size-6 animate-bounce group-hover:animate-none"/>
                </IconButton>
            </div>
        </OverlayScrollbarsComponent>
    );
  }
);

// For debugg with React DevTools
SearchResults.displayName = 'SearchResults';

export default SearchResults;
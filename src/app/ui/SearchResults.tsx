import { forwardRef } from 'react';
import { Event } from '@/app/lib/definitions';
import Link from 'next/link';
import Image from 'next/image';
import { UsersIcon } from '@heroicons/react/24/solid';
import IconButton from '@/app/ui/buttons/IconButton';
import { CalendarDaysIcon, XMarkIcon } from '@heroicons/react/16/solid';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import type { OverlayScrollbarsComponentRef } from 'overlayscrollbars-react';
import 'overlayscrollbars/styles/overlayscrollbars.css';
import Loader from '@/app/ui/animation/Loader';

interface SearchResultsProps {
    results: Event[];
    isLoading: boolean;
    onClose: () => void;
    anchorRef?: React.RefObject<HTMLDivElement | null>;
}

const SearchResults = forwardRef<OverlayScrollbarsComponentRef, SearchResultsProps>(
    ({ results, isLoading, onClose, anchorRef }, ref) => {
        return (
        <div
            className="absolute left-0 right-0 -z-1"
            style={{ top: anchorRef?.current?.offsetHeight || 0 }} 
        >
            <OverlayScrollbarsComponent
                ref={ref}
                options={{ scrollbars: { autoHide: 'scroll', autoHideDelay: 500 } }}
                defer
                className="w-full z-1 -top-10 bg-white dark:bg-[#303134] dark:hover:bg-[#292929] border-x border-b border-gray-200 dark:border-white/10 transform transition-transform duration-500 ease-out 
                       animate-slide-top  rounded-2xl md:rounded-3xl max-h-[71vh] overflow-hidden shadow-[0_12px_15px_rgb(0,0,0,0.5)] dark:shadow-[0_15px_18px_rgb(0,0,0,0.9)] shadow-[hsl(var(--always-black)/5.1%)]"
            >
                <div className="w-full p-4 mt-10">
                    {isLoading ? (
                    <>
                        <p className="text-center text-gray-700 dark:text-gray-300 py-6">Recherche en cours</p>
                        <Loader variant="dots" />
                    </>
                    ) : results.length > 0 ? (
                    <div className="grid  sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6 w-full justify-items-center">
                        {results.map((event) => (
                            <Link
                                href={`/event/${event.id}`}
                                key={event.id}
                                className="relative w-70 h-45 rounded-xl overflow-hidden border border-gray-300/20 dark:border-white/10 hover:border-[#08568a] dark:hover:border-[#ff952a] shadow-[0_10px_15px_rgb(0,0,0,0.4)] hover:shadow-[0_10px_15px_rgb(8,86,138,0.8)] dark:hover:shadow-[0_15px_20px_rgb(0,0,0,0.8)] bg-gray-500 group transform transition-all duration-600 ease-in-out translate-y-0 hover:-translate-y-1 scale-100 hover:scale-105"
                            >
                                <Image
                                    src={event.image_url || 'https://placehold.co/280x180.png?text=Event'}
                                    alt={`Affiche de ${event.title}`}
                                    fill
                                    className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
                                />

                                <div className="absolute inset-0 flex flex-col justify-end group-hover:bg-linear-to-t from-black/80 via-black/50 to-transparent text-white">
                                    
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
                                        <p className=" bottom-0 left-0 right-0 text-xs text-white mt-1.5 opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20 transform transition-all duration-900 ease-in-out ">
                                            {event.description_short || "Aucune description courte disponible."}
                                        </p>
                                    </div>
                                    
                                </div>
                            </Link>
                        ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <CalendarDaysIcon className="size-32 mx-auto mb-3 opacity-50" />
                            <p className="text-center">Aucun événement trouvé.</p>
                        </div>
                    )}
                </div>
                <div className="relative text-center m-2">
                    <IconButton
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-[#0088aa] dark:hover:text-[#ff952aff] bg-transparent hover:bg-gray-200 group"
                        aria-label="Fermer les résultats de recherche"
                        title="Fermer les résultats de recherche"
                    >
                        <XMarkIcon className="size-6 animate-bounce group-hover:animate-none" />
                    </IconButton>
                </div>
            </OverlayScrollbarsComponent>
        </div>
        );
    }
);

SearchResults.displayName = 'SearchResults';
export default SearchResults;
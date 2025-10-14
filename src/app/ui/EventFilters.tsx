'use client';

import { Event as EventBase } from '@/app/lib/definitions';
import { MapPinIcon, BookmarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/solid';

// extend Event to add event_type 
export type EventWithType = EventBase & {
    event_type: 'Concert' | 'Atelier' | 'Conférence' | 'Festival';
};

export interface EventFiltersState {
    keyword: string;
    location: string;
    eventType: string;
    startDate: string;
    endDate: string;
    showOnlyAvailable: boolean;
}

interface EventFiltersProps {
    filters: EventFiltersState;
    onFilterChange: (filters: EventFiltersState) => void;
    allEvents: EventWithType[];
    onResetFilters: () => void; 
}

export default function EventFilters({ filters, onFilterChange, allEvents, onResetFilters }: EventFiltersProps) {

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            onFilterChange({ ...filters, [name]: checked });
        } else {
            onFilterChange({ ...filters, [name]: value });
        }
    };

    const uniqueLocations = Array.from(new Set(allEvents.map(event => event.location))).sort();
    const uniqueEventTypes = Array.from(new Set(allEvents.map(event => event.event_type))).sort();

    return (
        <div className="backdrop-blur-2xl flex flex-wrap gap-6 min-[1200px]:gap-2 justify-between items-center sm:px-1 py-3 -mt-5 mb-10 bg-[#fcfff7] dark:bg-[#222222] rounded-3xl xl:rounded-full h-fit w-full sticky top-10 transition-transform duration-500 ease-in-out shadow-[0_0_32px_20px_#fcfff7] dark:shadow-[0_0_32px_20px_#222222]">
            <div className="flex gap-5 justify-between items-center h-fit p-2.5 bg-[#fcfff7] dark:bg-[#222222] border shadow-[0px_3px_3px_rgba(0,0,0,_0.2)] dark:shadow-[0px_5px_5px_rgba(0,0,0,_0.4)] shadow-[hsl(var(--always-black)/5.1%)] resize-none rounded-full border-gray-300 dark:border-white/20 ">
                <h3 className="text-xl font-bold text-gray-900 dark:text-[#ff952aff] inline-flex items-center ml-1">
                    <AdjustmentsHorizontalIcon className="size-6 mr-1"/>
                    <span>Filtres</span>
                </h3>
                <button 
                    onClick={onResetFilters} 
                    className="text-sm w-full pt-1 pb-1.5 px-3 rounded-full border-none bg-black/10 dark:bg-gray-800 transition-all ease-in-out duration-400 shadow-lg dark:shadow-[0px_2px_2px_rgba(0,0,0,_0.3)] focus:outline-none focus:ring-1 focus:ring-[#0088aa] dark:focus:ring-[#ff952aff]/50"
                >
                    Réinitialiser
                </button>
            </div>
                
                {/*Date Filter */}
                <div className="relative bg-[#fcfff7] dark:bg-[#222222] rounded-full shadow-[0px_3px_3px_rgba(0,0,0,_0.2)] dark:shadow-[0px_5px_5px_rgba(0,0,0,_0.4)] shadow-[hsl(var(--always-black)/5.1%)]">
                    <label className="absolute w-fit z-20 text-xs font-medium text-gray-700 dark:text-white/80 -translate-y-1/2 px-2 py-0 ml-4 bg-[#fcfff7] dark:bg-[#222222] rounded-full">
                        Date
                    </label>
                    <div className="flex space-x-2 w-full p-2.5 border resize-none rounded-full border-gray-300 dark:border-white/20 ">
                        <input 
                            type="date" 
                            name="startDate" 
                            value={filters.startDate} 
                            onChange={handleInputChange} 
                            className="block w-full pt-1 pb-1.5 px-2 rounded-full shadow-lg dark:shadow-[0px_2px_2px_rgba(0,0,0,_0.3)] border-none bg-black/10 dark:bg-gray-800 transition-all ease-in-out duration-400 focus:outline-none focus:ring-1 focus:ring-[#0088aa] dark:focus:ring-[#ff952aff]/50 sm:text-sm" 
                        />
                        <span>à</span>
                        <input 
                            type="date" 
                            name="endDate" 
                            value={filters.endDate} 
                            onChange={handleInputChange} 
                            className="block w-full pt-1 pb-1.5 px-2 rounded-full shadow-lg dark:shadow-[0px_2px_2px_rgba(0,0,0,_0.3)] border-none bg-black/10 dark:bg-gray-800 transition-all ease-in-out duration-400 focus:outline-none focus:ring-1 focus:ring-[#0088aa] dark:focus:ring-[#ff952aff]/50 sm:text-sm" 
                        />
                    </div>
                </div>

                {/* Location Filter */}
                <div className="relative  bg-[#fcfff7] dark:bg-[#222222] rounded-full shadow-[0px_3px_3px_rgba(0,0,0,_0.2)] dark:shadow-[0px_5px_5px_rgba(0,0,0,_0.4)] shadow-[hsl(var(--always-black)/5.1%)]">
                    <label 
                        htmlFor="location" 
                        className="absolute w-fit z-20 text-xs font-medium text-gray-700 dark:text-white/80 -translate-y-1/2 px-2 py-0 ml-4 bg-[#fcfff7] dark:bg-[#222222] rounded-full"
                    >
                        Lieu
                    </label>
                    <div className="relative inline-flex items-center p-2.5 border resize-none rounded-full border-gray-300 dark:border-white/20 focus:outline-none focus:ring-1 focus:ring-[#0088aa] dark:focus:ring-[#ff952aff]/50">
                        <MapPinIcon className="absolute size-4 translate-x-2"/>
                        <select 
                            name="location" 
                            id="location" 
                            value={filters.location} 
                            onChange={handleInputChange} 
                            className="inline-block w-full appearance-none shadow-lg dark:shadow-[0px_2px_2px_rgba(0,0,0,_0.3)] pt-1 pb-1.5 pl-8 pr-1.5 rounded-full border-none bg-black/10 dark:bg-gray-800 transition-all ease-in-out duration-400 focus:outline-none focus:ring-1 focus:ring-[#0088aa] dark:focus:ring-[#ff952aff]/50 sm:text-sm"
                        >
                            <option value="">Tous les lieux</option>
                            {uniqueLocations.map(location => (<option key={location} value={location}>{location}</option>))}
                        </select>
                    </div>
                </div>
                
                {/* Event Filter */}
                <div className="relative  bg-[#fcfff7] dark:bg-[#222222] rounded-full shadow-[0px_3px_3px_rgba(0,0,0,_0.2)] dark:shadow-[0px_5px_5px_rgba(0,0,0,_0.4)] shadow-[hsl(var(--always-black)/5.1%)]">
                    <label 
                        htmlFor="eventType" 
                        className="absolute w-fit z-20 text-xs font-medium text-gray-700 dark:text-white/80 -translate-y-1/2 px-2 py-0 ml-4 bg-[#fcfff7] dark:bg-[#222222] rounded-full"
                    >
                        Type d&apos;événement
                    </label>
                    <div className="relative inline-flex items-center w-45 p-2.5 border resize-none rounded-full border-gray-300 dark:border-white/20 focus:outline-none focus:ring-1 focus:ring-[#0088aa] dark:focus:ring-[#ff952aff]/50">
                        <BookmarkIcon className="absolute size-4 inline-block translate-x-2"/>
                        <select 
                            name="eventType" 
                            id="eventType" 
                            value={filters.eventType} 
                            onChange={handleInputChange} 
                            className="inline-block w-full appearance-none shadow-lg dark:shadow-[0px_2px_2px_rgba(0,0,0,_0.3)] pt-1 pb-1.5 pl-8 pr-1.5 rounded-full border-none bg-black/10 dark:bg-gray-800 transition-all ease-in-out duration-400 focus:outline-none focus:ring-1 focus:ring-[#0088aa] dark:focus:ring-[#ff952aff]/50 sm:text-sm"
                        >
                            <option value="">Tous les types</option>
                            {uniqueEventTypes.map(type => (<option key={type} value={type}>{type}</option>))}
                        </select>
                    </div>
            
                </div>

                {/* AvailableSeat CheckBox */}
            <div className="relative flex items-center h-fit p-2.5 border shadow-[0px_3px_3px_rgba(0,0,0,_0.2)] dark:shadow-[0px_5px_5px_rgba(0,0,0,_0.4)] shadow-[hsl(var(--always-black)/5.1%)] resize-none rounded-full bg-[#fcfff7] dark:bg-[#222222] border-gray-300 dark:border-white/20">
                <input
                    id="showOnlyAvailable"
                    name="showOnlyAvailable"
                    type="checkbox"
                    checked={filters.showOnlyAvailable}
                    onChange={handleInputChange}
                    className="peer absolute size-3 translate-x-2.5 z-10 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label
                    htmlFor="showOnlyAvailable"
                    className="inline-block text-sm text-gray-900 dark:text-white/80 relative z-1 pt-1 pb-1.5 pl-8 pr-3 rounded-full shadow-lg dark:shadow-[0px_2px_2px_rgba(0,0,0,_0.3)] border-none bg-black/10 dark:bg-gray-800 transition-all ease-in-out duration-400 peer-checked:ring-1 peer-checked:ring-[#0088aa] dark:peer-checked:ring-[#ff952aff]/50"
                >
                    Places disponibles
                </label>
            </div>
        </div>
    );
}
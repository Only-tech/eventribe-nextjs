import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { countUsers } from '@/app/lib/auth'; 
import { getAllEventsWithRegistrationCount, countRegistrations } from '@/app/lib/data';
import Link from 'next/link';
import { UsersIcon, CalendarDaysIcon, TicketIcon, PencilIcon, TrashIcon, PlusIcon, Cog6ToothIcon, EyeIcon } from '@heroicons/react/24/outline';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  // Redirect if not authenticated or not an admin
  if (!session || !session.user || !session.user.isAdmin) {
    redirect('/login'); 
  }

  // Fetch data for the dashboard
  const totalEvents = (await getAllEventsWithRegistrationCount()).length;
  const totalUsers = await countUsers();
  const totalRegistrations = await countRegistrations();

  return (
    <div className="p-3">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Tableau de bord Administrateur</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Events Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Total Événements</h2>
          <div className="flex items-center justify-center gap-2">
            <CalendarDaysIcon className="w-10 h-10 text-indigo-600" />
            <p className="text-5xl font-bold text-indigo-600">{totalEvents}</p>
          </div>
        </div>

        {/* Registered Users Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Utilisateurs Enregistrés</h2>
          <div className="flex items-center justify-center gap-2">
            <UsersIcon className="w-10 h-10 text-gray-600" />
            <p className="text-5xl font-bold text-gray-600">{totalUsers}</p>
          </div>
        </div>

        {/* Total Registrations Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Inscriptions Totales</h2>
          <div className="flex items-center justify-center gap-2">
            <TicketIcon className="w-10 h-10 text-gray-600" />
            <p className="text-5xl font-bold text-gray-600">{totalRegistrations}</p>
          </div>
        </div>
      </div>

      <div className="bg-white max-w-7xl rounded-lg shadow-lg [@media(max-width:412px)]:px-2 p-6 mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Actions Administrateur</h2>
        <div className="space-y-4">
          <Link href="/admin/manage-events" className="flex flex-col lg:flex-row items-center justify-between px-1 p-2 sm:p-5 rounded-2xl text-xl text-[#FFF] hover:text-gray-800 font-medium transition-colors border-[0.5px] border-transparent shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-gray-900 hover:bg-amber-50 hover:border-gray-800 cursor-pointer duration-300 ease-in-out w-full text-center group">
            <p className="lg:max-w-full lg:w-[80%] inline-flex items-center p-4"><Cog6ToothIcon className="inline-block w-6 h-6 mr-2 group-hover:animate-bounce" />Gérer les Événements</p>
            <div className="h-full w-full max-w-[90%] lg:py-7 lg:w-0 border-t-[0.2px] lg:border-r-[0.2px]"></div>
            <div className="w-full flex flex-row flex-wrap items-center justify-between lg:pl-8 lg:pr-4">
              <p className="inline-flex items-center p-4"><PlusIcon className="inline-block w-6 h-6 mr-2 group-hover:animate-bounce" />Créer</p>
              <p className="inline-flex items-center p-4"><PencilIcon className="inline-block w-6 h-6 mr-2 group-hover:animate-bounce" />Modifier</p>
              <p className="inline-flex items-center p-4"><TrashIcon className="inline-block w-6 h-6 mr-2 group-hover:animate-bounce" />Supprimer</p>
            </div>
          </Link>
          <Link href="/admin/manage-registrations" className="flex flex-col lg:flex-row items-center justify-between px-1 p-2 sm:p-5 rounded-2xl text-xl text-[#FFF] hover:text-gray-800 font-medium transition-colors border-[0.5px] border-transparent shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-gray-900 hover:bg-amber-50 hover:border-gray-800 cursor-pointer duration-300 ease-in-out w-full text-center group">
            <p className="lg:max-w-full lg:w-[80%] inline-flex items-center p-4"><Cog6ToothIcon className="inline-block w-6 h-6 mr-2 group-hover:animate-bounce" />Gérer les Inscriptions</p>
            <div className="h-full w-full max-w-[90%] lg:py-7 lg:w-0 border-t-[0.2px] lg:border-r-[0.2px]"></div>
            <div className="w-full flex flex-row flex-wrap items-center justify-between lg:pl-8 lg:pr-4">
              <p className="inline-flex items-center p-4"><EyeIcon className="inline-block w-6 h-6 mr-2 group-hover:animate-bounce" />Voir les participants</p>
              <p className="inline-flex items-center p-4"><TrashIcon className="inline-block w-6 h-6 mr-2 group-hover:animate-bounce" />Désinscrire</p>
            </div>
          </Link>
          <Link href="/admin/manage-users" className="flex flex-col lg:flex-row items-center justify-between px-1 p-2 sm:p-5 rounded-2xl text-xl text-[#FFF] hover:text-gray-800 font-medium transition-colors border-[0.5px] border-transparent shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-gray-900 hover:bg-amber-50 hover:border-gray-800 cursor-pointer duration-300 ease-in-out w-full text-center group">
            <p className="lg:max-w-full lg:w-[80%] inline-flex items-center p-4"><Cog6ToothIcon className="inline-block w-6 h-6 mr-2 group-hover:animate-bounce" />Gérer les Utilisateurs</p>
            <div className="h-full w-full max-w-[90%] lg:py-7 lg:w-0 border-t-[0.2px] lg:border-r-[0.2px]"></div>
            <div className="w-full flex flex-row flex-wrap items-center justify-between lg:pl-8 lg:pr-4">
              <p className="inline-flex items-center p-4"><PencilIcon className="inline-block w-6 h-6 mr-2 group-hover:animate-bounce" />Modifier les rôles</p>
              <p className="inline-flex items-center p-4"><TrashIcon className="inline-block w-6 h-6 mr-2 group-hover:animate-bounce" />Supprimer</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

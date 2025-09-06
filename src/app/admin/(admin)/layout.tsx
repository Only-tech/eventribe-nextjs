import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
// Providers is in the global layout
import OnTopButton from '@/app/ui/on-top-button';
import AdminHeader from '@/app/admin/(admin)/ui/admin-header'; 
import AdminFooter from '@/app/admin/(admin)/ui/admin-footer'; 


export const metadata = {
  title: 'eventribe - Administration',
  description: 'Tableau de bord d\'administration des événements',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Redirects user if is not logged in or is not admin
  if (!session || !session.user || !session.user.isAdmin) {
    redirect('/login');
  }

  return (
    <> {/* Using a fragment because <html> and <body> are in the global root layout */}
      <div className="admin min-h-screen w-full flex flex-col text-[#333] bg-[#f4f7f6] bg-cover bg-fixed bg-center font-sans"
          style={{ backgroundImage: "url('/images/SplashPaint.svg')" }}> 
        <AdminHeader />
        <main className="flex-grow max-w-[98%] sm:max-w-[95%] xl:max-w-[90%] w-full py-8 mx-auto mt-[80px]">
          {children}
        </main>
        <OnTopButton /> 
        <AdminFooter /> 
      </div>
    </>
  );
}

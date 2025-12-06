// 'use client';

// import type { Session } from 'next-auth';
// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { signOut } from 'next-auth/react';
// import { UserCircleIcon, ShieldCheckIcon,  QuestionMarkCircleIcon, ExclamationTriangleIcon, BanknotesIcon } from '@heroicons/react/24/outline'; 
// import { ChevronUpIcon, CalendarDaysIcon } from '@heroicons/react/16/solid';
// import ConfirmationModal from '@/app/ui/ConfirmationModal'; 
// import FloatingLabelInput from '@/app/ui/FloatingLabelInput';
// import ActionButton from '@/app/ui/buttons/ActionButton';
// import PlaneLogo from '@/app/ui/logo/PlaneLogo';
// import Loader from '@/app/ui/animation/Loader';
// import EventManagement from '@/app/ui/account/EventManagement';
// import PaymentMethods from '@/app/ui/account/PaymentMethods';
// import IconButton from '@/app/ui/buttons/IconButton';
// import { useToast } from '@/app/ui/status/ToastProvider';
// import { TrashIcon } from '@heroicons/react/24/solid';

// type ActiveView = 'info' | 'security' | 'payments' | 'events' | 'help' | null;

// export default function UserAccountManageEventsPage() {

//     const router = useRouter();

//     const [session, setSession] = useState<Session | null>(null);
//     const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
    
//     const [activeView, setActiveView] = useState<ActiveView>('info');
//     const [isViewLoading, setIsViewLoading] = useState(false);

//     const [isNavCollapsed, setIsNavCollapsed] = useState(false);

//     const [firstName, setFirstName] = useState('');
//     const [lastName, setLastName] = useState('');
//     const [email, setEmail] = useState('');
//     const [isAccountUpdating, setIsAccountUpdating] = useState(false);
    
//     const [eventCount, setEventCount] = useState(0);
//     const [totalRegistered, setTotalRegistered] = useState(0);
    
//     const { addToast } = useToast();

//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [modalMessage, setModalMessage] = useState('');
//     const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
//     const [isDeletingAccount, setIsDeletingAccount] = useState(false);

//     // ==== Manage Confirmation Modal bind to EventManagement ====
//     const openConfirmationModal = (msg: string, actionFn: () => void) => {
//         setModalMessage(msg);
//         setConfirmAction(() => actionFn); 
//         setIsModalOpen(true);
//     };

//     const closeConfirmationModal = () => {
//         setIsModalOpen(false);
//         setModalMessage('');
//         setConfirmAction(null);
//     };

//     // ====== Fetch session on loading =======
//     useEffect(() => {
//         const fetchSession = async () => {
//             try {
//                 const res = await fetch('/api/auth/session');
//                 if (res.ok) {
//                     const data = await res.json();
//                     if (data && Object.keys(data).length > 0) {
//                         setSession(data);
//                         setAuthStatus('authenticated');
//                     } else {
//                         setSession(null);
//                         setAuthStatus('unauthenticated');
//                     }
//                 } else {
//                     setAuthStatus('unauthenticated');
//                 }
//             } catch (error) {
//                 console.error('Failed to fetch session:', error);
//                 setAuthStatus('unauthenticated');
//             }
//         };
//         fetchSession();
//     }, []);

//     // ==== Authentication status =====
//     useEffect(() => {
//         if (authStatus === 'unauthenticated') {
//             window.location.href = '/login';
//         }  
        
//         if (authStatus === 'authenticated' && session?.user) {
//             setFirstName(session.user.firstName ?? '');
//             setLastName(session.user.lastName ?? '');
//             setEmail(session.user.email ?? '');
//             fetchEventSummary(); 
//         }
//     }, [authStatus, session]);

//     const handleViewChange = (view: ActiveView) => {
//         if (window.innerWidth < 1024 && view === activeView) {
//             setActiveView(null);
//             return;
//         }

//         setIsViewLoading(true);
//         setActiveView(view);
        
//         setTimeout(() => {
//             setIsViewLoading(false);
//         }, 250);
//     };

//     // ==== Update Account =====
//     const handleUpdateAccount = async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         addToast('');
//         setIsAccountUpdating(true);

//         try {
//             const response = await fetch('/api/account/update', {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ firstName, lastName, email }),
//             });
//             const data = await response.json();

//             if (response.ok) {
//                 addToast('Informations de compte mises à jour avec succès.', 'success');
//                 router.refresh(); 
//             } else {
//                 addToast(data.message || 'Échec de la mise à jour des informations.', 'error');
//             }
//         } catch (error) {
//             console.error('Erreur lors de la mise à jour du compte:', error);
//             addToast('Une erreur est survenue. Veuillez réessayer plus tard.', 'error');
//         } finally {
//             setIsAccountUpdating(false);
//         }
//     };

//     // ===== Display Events Count & Events Registered Users count =====
//     type EventWithCount = Event & { registered_count: number };

//     const fetchEventSummary = async () => {
//         try {
//             const res = await fetch('/api/account/events'); 
//             const data = await res.json();
//             if (res.ok && Array.isArray(data)) {
//                 const events = data as EventWithCount[];
//                 setEventCount(events.length);
//                 const totalReg = events.reduce((acc, event) => acc + event.registered_count, 0);
//                 setTotalRegistered(totalReg);
//             }
//         } catch (error) {
//             console.error("Erreur lors du chargement du résumé des événements", error);
//         }
//     };

//     // ===== Delete Account =====
//     const executeDeleteAccount = async () => {
//         closeConfirmationModal();
//         setIsDeletingAccount(true);
//         try {
//             const response = await fetch('/api/account/delete', { method: 'DELETE' });
//             const data = await response.json();
//             if (response.ok) {
//                 addToast(data.message);
//                 await signOut({ callbackUrl: '/' });
//             } else {
//                 addToast(data.message || 'Erreur lors de la suppression du compte.', 'error');
//             }
//         } catch (error) {
//             console.error('Erreur lors de la suppression du compte:', error);
//             addToast('Une erreur est survenue lors de la suppression.', 'error');
//         } finally {
//             setIsDeletingAccount(false);
//         }
//     };

//     const handleDeleteAccount = () => {
//         openConfirmationModal(
//             'Êtes-vous sûr de vouloir supprimer votre compte ?\n\nCette action est irréversible. Toutes vos données seront supprimées.',
//             executeDeleteAccount
//         );
//     };


//     // ========== Side Bar Nav ============
//     const renderSidebarNav = () => (
//         <>
//             {/* --- Account Info Card ---- */}
//             <section className={`relative bg-white dark:bg-[#1E1E1E] rounded-xl ${isNavCollapsed ? 'p-2' : ' p-1 sm:p-8 lg:p-6  border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative shadow-lg hover:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:shadow-[0_10px_12px_rgb(0,0,0,0.5)] dark:hover:shadow-[0_12px_15px_rgb(0,0,0,0.8)]'}`}>
//                 <div className={`hidden lg:flex  ${isNavCollapsed ? 'justify-end' : 'absolute z-0 top-0 right-0'}`}>
//                     <IconButton onClick={() => setIsNavCollapsed(!isNavCollapsed)} title={isNavCollapsed ? 'Agrandir' : 'Réduire'} className={`bg-transparent p-0 shadow-none hover:bg-transparent hover:shadow-[0_12px_15px_rgb(0,0,0,0.4)] overflow-hidden group ${isNavCollapsed ? '-mt-3 -mr-3' : ''}`}>
//                         <ChevronUpIcon className={`size-6 dark:text-gray-300 transition-transform duration-900 animate-bounce group-hover:animate-none ${isNavCollapsed ? ' rotate-45' : 'rotate-225'}`} />
//                     </IconButton>
//                 </div>
//                 <h3 className={`text-lg font-bold text-gray-900 dark:text-[#ff952aff] max-lg:mx-8 max-sm:mt-2 mb-4 ${isNavCollapsed ? 'lg:hidden' : ''}`}>Mon Compte</h3>
//                 <nav className="space-y-2">
//                     <button
//                         onClick={() => handleViewChange('info')}
//                         className={`flex items-center w-full gap-3 px-3 [1024px]:px-0.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${isNavCollapsed ? 'lg:justify-center' : ''} ${
//                             activeView === 'info' 
//                             ? 'bg-[#d9dad9] dark:bg-gray-800 text-gray-800 dark:text-white/90 shadow-lg dark:shadow-[0px_2px_2px_rgba(0,0,0,0.3)]' 
//                             : 'hover:bg-gray-100 dark:hover:bg-white/10'
//                         }`}
//                     >
//                         <UserCircleIcon className={`${isNavCollapsed ? 'size-7' : 'size-5'} flex-shrink-0`} />
//                         <span className={isNavCollapsed ? 'lg:hidden' : 'truncate'}>Informations personnelles</span>
//                     </button>
//                     {/* ---- Account Info Mobile Content ---- */}
//                     <div className="lg:hidden">
//                         {activeView === 'info' && (isViewLoading ? <Loader variant="dots" /> : renderAccountInfo())}
//                     </div>


//                     <button
//                         onClick={() => handleViewChange('payments')}
//                         className={`flex items-center w-full gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
//                             activeView === 'payments'
//                             ? 'bg-[#d9dad9] dark:bg-gray-800 text-gray-800 dark:text-white/90 shadow-lg'
//                             : 'hover:bg-gray-100 dark:hover:bg-white/10'
//                         }`}
//                     >
//                         <BanknotesIcon className={`${isNavCollapsed ? 'ml-1.5 size-7' : 'size-5'} flex-shrink-0`} />
//                         <span className={isNavCollapsed ? 'lg:hidden' : 'truncate'}>Moyens de paiement</span>
//                     </button>

//                     {/* ---- Payments Mobile Content --- */}
//                     <div className="lg:hidden">
//                         {activeView === 'payments' && (isViewLoading ? <Loader variant="dots" /> : renderPaymentMethods())}
//                     </div>


//                     <button
//                         onClick={() => handleViewChange('security')}
//                         className={`flex items-center w-full gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${isNavCollapsed ? 'lg:justify-center' : ''} ${
//                             activeView === 'security' 
//                             ? 'bg-[#d9dad9] dark:bg-gray-800 text-gray-800 dark:text-white/90 shadow-lg dark:shadow-[0px_2px_2px_rgba(0,0,0,0.3)]' 
//                             : 'hover:bg-gray-100 dark:hover:bg-white/10'
//                         }`}
//                     >
//                         <ShieldCheckIcon className={`${isNavCollapsed ? 'size-7' : 'size-5'} flex-shrink-0`} />
//                         <span className={isNavCollapsed ? 'lg:hidden' : ''}>Sécurité</span>
//                     </button>
//                     {/* ---- Security Mobile Content --- */}
//                     <div className="lg:hidden">
//                         {activeView === 'security' && (isViewLoading ? <Loader variant="dots" /> : renderAccountSecurity())}
//                     </div>
//                 </nav>
//             </section>
            
//             {/* --- Events Card --- */}
//             <section className={`bg-white dark:bg-[#1E1E1E] rounded-xl ${isNavCollapsed ? 'p-2' : ' p-1 sm:p-8 lg:p-6  border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative shadow-lg hover:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:shadow-[0_10px_12px_rgb(0,0,0,0.5)] dark:hover:shadow-[0_12px_15px_rgb(0,0,0,0.8)]'}`}>
//                 <h3 className={`text-lg font-bold text-gray-900 dark:text-[#ff952aff]  max-lg:mx-8 max-sm:mt-2 mb-4 ${isNavCollapsed ? 'lg:hidden' : ''}`}>Mes événements</h3>
//                 <nav className="space-y-2">
//                     <button
//                         onClick={() => handleViewChange('events')}
//                         className={`flex items-center w-full gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${isNavCollapsed ? 'lg:justify-center' : ''} ${
//                             activeView === 'events' 
//                             ? 'bg-[#d9dad9] dark:bg-gray-800 text-gray-800 dark:text-white/90 shadow-lg dark:shadow-[0px_2px_2px_rgba(0,0,0,0.3)]' 
//                             : 'hover:bg-gray-100 dark:hover:bg-white/10'
//                         }`}
//                     >
//                         <CalendarDaysIcon className={`${isNavCollapsed ? 'size-7' : 'size-5'} flex-shrink-0`} />
//                         <span className={isNavCollapsed ? 'lg:hidden' : ''}>Gérer</span>
//                     </button>
//                     {/* ---- Events Mobile Content --- */}
//                     <div className="lg:hidden">
//                         {activeView === 'events' && (isViewLoading ? <Loader variant="dots" /> : renderEventContent())}
//                     </div>
//                 </nav>
//             </section>

//             {/* ---- Help Card --- */}
//             <section className={`bg-white dark:bg-[#1E1E1E] rounded-xl ${isNavCollapsed ? 'p-2' : ' p-1 sm:p-8 lg:p-6  border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative shadow-lg hover:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:shadow-[0_10px_12px_rgb(0,0,0,0.5)] dark:hover:shadow-[0_12px_15px_rgb(0,0,0,0.8)]'}`}>                
//                 <h3 className={`text-lg font-bold text-gray-900 dark:text-[#ff952aff] max-lg:mx-8 max-sm:mt-2 mb-4 ${isNavCollapsed ? 'lg:hidden' : ''}`}>Aide</h3>
//                 <nav className="space-y-2">
//                     <button
//                         onClick={() => handleViewChange('help')}
//                         className={`flex items-center w-full gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${isNavCollapsed ? 'lg:justify-center' : ''} ${
//                             activeView === 'help' 
//                             ? 'bg-[#d9dad9] dark:bg-gray-800 text-gray-800 dark:text-white/90 shadow-lg dark:shadow-[0px_2px_2px_rgba(0,0,0,0.3)]' 
//                             : 'hover:bg-gray-100 dark:hover:bg-white/10'
//                         }`}
//                     >
//                         <QuestionMarkCircleIcon className={`${isNavCollapsed ? 'size-7' : 'size-5'} flex-shrink-0`} />
//                         <span className={isNavCollapsed ? 'lg:hidden' : ''}>Support</span>
//                     </button>
//                     {/* --- Help Mobile Content --- */}
//                     <div className="lg:hidden">
//                         {activeView === 'help' && (isViewLoading ? <Loader variant="dots" /> : renderHelpSection())}
//                     </div>
//                 </nav>
//             </section>
//         </>
//     );

//     // ========= Main containt diplayed on Desktop =========
//     const renderMainContent = () => {
//         if (isViewLoading) {
//             return (
//                 <div className="flex justify-center items-center h-64">
//                     <Loader variant="dots" />
//                 </div>
//             );
//         }
        
//         switch (activeView) {
//             case 'info':
//                 return renderAccountInfo();
//             case 'security':
//                 return renderAccountSecurity();
//             case 'payments':
//                 return renderPaymentMethods();
//             case 'events':
//                 return renderEventContent();
//             case 'help':
//                 return renderHelpSection();
//             default:
//                 return renderAccountInfo();
//         }
//     };

//     // ============ Account Info =============
//     const renderAccountInfo = () => (
//         <section className="bg-[#FCFFF7] dark:bg-[#1E1E1E] rounded-xl p-4 sm:p-6 md:p-8 my-4 lg:my-0  border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative shadow-[0_10px_15px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:shadow-[0_12px_15px_rgb(0,0,0,0.6)] dark:hover:shadow-[0_12px_15px_rgb(0,0,0,0.8)]">
//             <h2 className="hidden lg:flex text-2xl font-bold text-gray-900 dark:text-white/90 mb-6">
//                 Informations personnelles
//             </h2>
//             <form className="space-y-6 lg:space-x-6 lg:grid lg:grid-cols-2" onSubmit={handleUpdateAccount}>
//                 <FloatingLabelInput id="firstName" label="Prénom" type="text" value={firstName ?? ''} onChange={(e) => setFirstName(e.target.value)} required />
//                 <FloatingLabelInput id="lastName" label="Nom" type="text" value={lastName ?? ''} onChange={(e) => setLastName(e.target.value)} required />
//                 <div className=" lg:col-span-2">
//                     <FloatingLabelInput id="email" label="Adresse email" type="email" value={email ?? ''} onChange={(e) => setEmail(e.target.value)} required />                    
//                 </div>
                
//                 <div className="flex justify-end lg:col-span-2">
//                     <ActionButton type="submit" variant="primary" isLoading={isAccountUpdating} className="flex-1 sm:flex-none sm:w-48">
//                         <span className="ml-2.5">{isAccountUpdating ? 'Mise à jour' : 'Enregistrer'}</span>
//                         {!isAccountUpdating && ( <ChevronUpIcon className="inline-block size-6 ml-2 rotate-90 group-hover:animate-bounce" /> )}
//                     </ActionButton>
//                 </div>
//             </form>
//         </section>
//     );

//     // ========= Payment Methods =============
//     const renderPaymentMethods = () => (
//         session?.user?.id ? <PaymentMethods userId={Number(session.user.id)} /> : null
//     );

//     // ========= Delete Account =============
//     const renderAccountSecurity = () => (
//         <section className="bg-white dark:bg-[#1E1E1E] rounded-xl p-1 lg:p-8 mt-4 lg:mt-0 border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative shadow-[0_10px_15px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:shadow-[0_12px_15px_rgb(0,0,0,0.6)] dark:hover:shadow-[0_12px_15px_rgb(0,0,0,0.8)]">
//             <h2 className="hidden lg:flex text-2xl font-bold text-gray-900 dark:text-white/90 mb-6">
//                 Sécurité
//             </h2>
            
//             <div className="border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
//                 <h3 className="text-lg font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
//                     <ExclamationTriangleIcon className="size-6" />
//                     Zone de danger
//                 </h3>
//                 <p className="text-red-700 dark:text-red-400 mt-2 text-sm">
//                     La suppression de votre compte est définitive. Toutes vos données, y compris les événements que vous avez créés et vos inscriptions, seront supprimées et ne pourront pas être récupérées.
//                 </p>
//                 <div className="mt-4 flex justify-center sm:justify-end">
//                     <ActionButton
//                         variant="destructive"
//                         onClick={handleDeleteAccount}
//                         isLoading={isDeletingAccount}
//                     >
//                         {isDeletingAccount ? <span className="ml-4">Suppression</span> : <><TrashIcon className="size-6 mr-4" /><span> Supprimer mon compte</span></>}
//                     </ActionButton>
//                 </div>
//             </div>
//         </section>
//     );

//     // =========== Manage Events =============
//     const renderEventContent = () => (
//         <EventManagement 
//             session={session} 
//             openModal={openConfirmationModal} 
//             closeModal={closeConfirmationModal}
//         />
//     );

//     // ========= Support =============
//     const renderHelpSection = () => (
//         <section className="bg-white dark:bg-[#1E1E1E] rounded-xl p-3 sm:p-6 md:p-8 mt-4 lg:mt-0 border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative shadow-[0_10px_15px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:shadow-[0_12px_15px_rgb(0,0,0,0.6)] dark:hover:shadow-[0_12px_15px_rgb(0,0,0,0.8)]">
//             <h2 className="text-2xl font-bold hidden lg:flex text-gray-900 dark:text-white/90 mb-6">
//                 Aide et Support
//             </h2>
//             <p className="text-gray-700 dark:text-gray-300 mb-4">
//                 Pour toute question ou problème, veuillez contacter notre service client.
//             </p>
//             <div className="flex justify-center sm:justify-end">
//                 <ActionButton
//                     variant="primary"
//                     onClick={() => window.location.href = 'mailto:support@eventribe.com'}
//                 >
//                     Contacter le support
//                     <PlaneLogo className="group-hover:animate-bounce"/>
//                 </ActionButton>
//             </div>
//         </section>
//     );

//     // ========= Summary Side Bar ===========
//     const renderSummarySidebar = () => (
//         <aside className="max-md:flex max-md:justify-between lg:col-span-1 bg-white dark:bg-[#1E1E1E] md:rounded-xl max-md:pt-0 p-6 space-y-3 md:p-8 md:border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative md:shadow-lg hover:md:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:md:shadow-[0_10px_12px_rgb(0,0,0,0.5)] dark:hover:md:shadow-[0_12px_15px_rgb(0,0,0,0.8)]">
//             <p className="flex justify-between items-baseline  max-md:space-x-4">
//                 <span className="text-gray-600 dark:text-gray-400">Événements créés </span>
//                 <span className="text-2xl font-bold text-gray-900 dark:text-white/90">{eventCount}</span>
//             </p>
//             <p className="flex justify-between items-baseline max-md:space-x-4">
//                 <span className="text-gray-600 dark:text-gray-400">Inscrits </span>
//                 <span className="text-2xl font-bold text-gray-900 dark:text-white/90">{totalRegistered}</span>
//             </p>
//         </aside>
//     );

//     // ===== Page Render =====
//     return (
//         <div className="max-w-[95%] mx-auto">
//             {authStatus === 'loading' && (
//                 <>
//                     <p className="text-center text-xl text-gray-700 dark:text-white/70 py-6">Chargement de la session</p>
//                     <Loader variant="dots" />
//                 </>
//             )}
            
//             {authStatus === 'authenticated' && session && (
//                 <div className="space-y-8">
//                     <div className="md:grid grid-cols-3 lg:grid-cols-4 gap-8 max-md:overflow-hidden max-md:rounded-xl max-md:border border-gray-300 dark:border-white/10 translate-y-0 hover:max-md:-translate-y-1 transform transition-transform duration-700 ease max-md:shadow-lg hover:max-md:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:max-md:shadow-[0_10px_12px_rgb(0,0,0,0.5)] dark:hover:max-md:shadow-[0_12px_15px_rgb(0,0,0,0.8)]">
//                         {/* --- head page --- */}
//                         <div className="flex space-x-4 md:col-span-2 lg:col-span-3 bg-white dark:bg-[#1E1E1E] md:rounded-xl  p-6 md:p-8 md:border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative md:shadow-lg hover:md:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:md:shadow-[0_10px_12px_rgb(0,0,0,0.5)] dark:hover:md:shadow-[0_12px_15px_rgb(0,0,0,0.8)]">
//                             <UserCircleIcon className="hidden min-[475px]:inline-block size-18" />
//                             <div className="">
//                                 <h1 className="text-3xl font-bold text-gray-900 dark:text-white/90">
//                                     Bonjour {session.user.firstName},
//                                 </h1>
//                                 <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
//                                     Bienvenue sur votre espace personnel !
//                                 </p>
//                             </div>
//                         </div>
//                         {renderSummarySidebar()}
//                     </div>

//                     {/* --- Main container --- */}
//                     <div className={`grid grid-cols-1 lg:gap-8 lg:grid ${ isNavCollapsed ? 'lg:grid-cols-[80px_1fr_288px]' : 'lg:grid-cols-[calc(25%)_1fr_calc(25%)]' } transition-all duration-300`}>
                        
//                         <aside className={`relative space-y-6 lg:sticky lg:top-10 h-fit ${isNavCollapsed ? 'lg:space-y-0 lg:w-20 bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease shadow-lg hover:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:shadow-[0_10px_12px_rgb(0,0,0,0.5)] dark:hover:shadow-[0_12px_15px_rgb(0,0,0,0.8)]' : 'lg:w-full'}`}>
//                             {renderSidebarNav()}
//                         </aside>
                        
//                         <main className="hidden lg:block lg:col-span-2 space-y-6">
//                             {renderMainContent()}
//                         </main>
//                     </div>
//                 </div>
//             )}

//             <ConfirmationModal isOpen={isModalOpen} message={modalMessage} onConfirm={confirmAction || (() => {})} onCancel={closeConfirmationModal} />
//         </div>
//     );
// }

'use client';

import type { Session } from 'next-auth';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { UserCircleIcon, ShieldCheckIcon,  QuestionMarkCircleIcon, ExclamationTriangleIcon, BanknotesIcon } from '@heroicons/react/24/outline'; 
import { ChevronUpIcon, CalendarDaysIcon } from '@heroicons/react/16/solid';
import ConfirmationModal from '@/app/ui/ConfirmationModal'; 
import FloatingLabelInput from '@/app/ui/FloatingLabelInput';
import ActionButton from '@/app/ui/buttons/ActionButton';
import PlaneLogo from '@/app/ui/logo/PlaneLogo';
import Loader from '@/app/ui/animation/Loader';
import EventManagement from '@/app/ui/account/EventManagement';
import PaymentMethods from '@/app/ui/account/PaymentMethods';
import IconButton from '@/app/ui/buttons/IconButton';
import { useToast } from '@/app/ui/status/ToastProvider';
import { TrashIcon } from '@heroicons/react/24/solid';

type ActiveView = 'info' | 'security' | 'payments' | 'events' | 'help' | null;

export default function UserAccountManageEventsPage() {

    const router = useRouter();

    const [session, setSession] = useState<Session | null>(null);
    const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
    
    const [activeView, setActiveView] = useState<ActiveView>('info');
    const [isViewLoading, setIsViewLoading] = useState(false);

    const [isNavCollapsed, setIsNavCollapsed] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [isAccountUpdating, setIsAccountUpdating] = useState(false);
    
    const [eventCount, setEventCount] = useState(0);
    const [totalRegistered, setTotalRegistered] = useState(0);
    
    const { addToast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    // ==== Manage Confirmation Modal bind to EventManagement ====
    const openConfirmationModal = (msg: string, actionFn: () => void) => {
        setModalMessage(msg);
        setConfirmAction(() => actionFn); 
        setIsModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setIsModalOpen(false);
        setModalMessage('');
        setConfirmAction(null);
    };

    // ====== Fetch session on loading =======
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await fetch('/api/auth/session');
                if (res.ok) {
                    const data = await res.json();
                    if (data && Object.keys(data).length > 0) {
                        setSession(data);
                        setAuthStatus('authenticated');
                    } else {
                        setSession(null);
                        setAuthStatus('unauthenticated');
                    }
                } else {
                    setAuthStatus('unauthenticated');
                }
            } catch (error) {
                console.error('Failed to fetch session:', error);
                setAuthStatus('unauthenticated');
            }
        };
        fetchSession();
    }, []);

    // ==== Authentication status =====
    useEffect(() => {
        if (authStatus === 'unauthenticated') {
            window.location.href = '/login';
        }  
        
        if (authStatus === 'authenticated' && session?.user) {
            setFirstName(session.user.firstName ?? '');
            setLastName(session.user.lastName ?? '');
            setEmail(session.user.email ?? '');
            fetchEventSummary(); 
        }
    }, [authStatus, session]);

    const handleViewChange = (view: ActiveView) => {
        if (window.innerWidth < 1024 && view === activeView) {
            setActiveView(null);
            return;
        }

        setIsViewLoading(true);
        setActiveView(view);
        
        setTimeout(() => {
            setIsViewLoading(false);
        }, 250);
    };

    // ==== Update Account =====
    const handleUpdateAccount = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        addToast('');
        setIsAccountUpdating(true);

        try {
            const response = await fetch('/api/account/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email }),
            });
            const data = await response.json();

            if (response.ok) {
                addToast('Informations de compte mises à jour avec succès.', 'success');
                router.refresh(); 
            } else {
                addToast(data.message || 'Échec de la mise à jour des informations.', 'error');
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du compte:', error);
            addToast('Une erreur est survenue. Veuillez réessayer plus tard.', 'error');
        } finally {
            setIsAccountUpdating(false);
        }
    };

    // ===== Display Events Count & Events Registered Users count =====
    type EventWithCount = Event & { registered_count: number };

    const fetchEventSummary = async () => {
        try {
            const res = await fetch('/api/account/events'); 
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                const events = data as EventWithCount[];
                setEventCount(events.length);
                const totalReg = events.reduce((acc, event) => acc + event.registered_count, 0);
                setTotalRegistered(totalReg);
            }
        } catch (error) {
            console.error("Erreur lors du chargement du résumé des événements", error);
        }
    };

    // ===== Delete Account =====
    const executeDeleteAccount = async () => {
        closeConfirmationModal();
        setIsDeletingAccount(true);
        try {
            const response = await fetch('/api/account/delete', { method: 'DELETE' });
            const data = await response.json();
            if (response.ok) {
                addToast(data.message);
                await signOut({ callbackUrl: '/' });
            } else {
                addToast(data.message || 'Erreur lors de la suppression du compte.', 'error');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du compte:', error);
            addToast('Une erreur est survenue lors de la suppression.', 'error');
        } finally {
            setIsDeletingAccount(false);
        }
    };

    const handleDeleteAccount = () => {
        openConfirmationModal(
            'Êtes-vous sûr de vouloir supprimer votre compte ?\n\nCette action est irréversible. Toutes vos données seront supprimées.',
            executeDeleteAccount
        );
    };

    const menu = [
        { key: "info" as const, title: "Mon Compte", label: "Informations personnelles", icon: UserCircleIcon },
        { key: "payments" as const, label: "Moyens de paiement", icon: BanknotesIcon },
        { key: "security" as const, label: "Sécurité", icon: ShieldCheckIcon },
        { key: "events" as const, title: "Mes événements", label: "Gérer", icon: CalendarDaysIcon },
        { key: "help" as const, title: "Aide", label: "Support", icon: QuestionMarkCircleIcon },
    ];

    // ========== Side Bar Nav ============
    const renderSidebarNav = () => (
        <>
            {/* ---- Generated Card Menu --- */}
            <section className={`relative bg-white dark:bg-[#1E1E1E] rounded-xl transform transition-transform duration-700 ease ${isNavCollapsed ? 'p-2' : 'p-1 sm:p-8 lg:p-6 border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 relative shadow-lg hover:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:shadow-[0_10px_12px_rgb(0,0,0,0.5)] dark:hover:shadow-[0_12px_15px_rgb(0,0,0,0.8)]'}`}>
                <div className={`hidden lg:flex  ${isNavCollapsed ? 'justify-end' : 'absolute z-0 top-0 right-0'}`}>
                    <IconButton onClick={() => setIsNavCollapsed(!isNavCollapsed)} title={isNavCollapsed ? 'Agrandir' : 'Réduire'} className={`bg-transparent p-0 shadow-none hover:bg-transparent hover:shadow-[0_12px_15px_rgb(0,0,0,0.4)] overflow-hidden group ${isNavCollapsed ? '-mt-3 -mr-3' : ''}`}>
                        <ChevronUpIcon className={`size-6 dark:text-gray-300 transition-transform duration-900 animate-bounce group-hover:animate-none ${isNavCollapsed ? ' rotate-45' : 'rotate-225'}`} />
                    </IconButton>
                </div>

                <nav className="space-y-2">
                    {menu.map(({ key, title, label, icon: Icon }, index) => (
                        <div key={key}>
                            <h3 className={`text-lg font-bold text-gray-900 dark:text-[#ff952aff] max-lg:mx-8 
                                    ${isNavCollapsed ? 'lg:hidden' : ''} 
                                    ${index > 0 && title ? ' mt-6 pt-6 border-t border-gray-300 dark:border-white/10' : ''}
                                    ${index > -1 && title ? 'max-sm:mt-2 mb-4' : ''}
                                `}
                            >
                                {title}
                            </h3>
                            <button
                                onClick={() => handleViewChange(key)}
                                className={`flex items-center w-full gap-3 px-3 [1024px]:px-0.5 py-2 rounded-lg text-left transition-colors duration-500 ease-in-out cursor-pointer ${
                                activeView === key
                                    ? "bg-[#d9dad9] dark:bg-gray-800 text-gray-800 dark:text-white/90 shadow-lg dark:shadow-[0px_2px_2px_rgba(0,0,0,0.3)]"
                                    : "hover:bg-gray-100 dark:hover:bg-white/10"
                                }`}
                            >
                                <Icon className={`${isNavCollapsed ? "size-9" : "size-6"} shrink-0 text-[#08568a] dark:text-white/90`} />
                                <span className={isNavCollapsed ? "lg:hidden" : "truncate"}>{label}</span>
                            </button>

                            {/* Mobile preview */}
                            <div className="lg:hidden">
                                {activeView === key && (isViewLoading ? <Loader variant="dots" /> : renderMainContent())}
                            </div>
                        </div>
                    ))}
                </nav>
            </section>
        </>
    );

    // ========= Main containt diplayed on Desktop =========
    const renderMainContent = () => {
        if (isViewLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader variant="dots" />
                </div>
            );
        }
        
        switch (activeView) {
            case 'info':
                return renderAccountInfo();
            case 'security':
                return renderAccountSecurity();
            case 'payments':
                return renderPaymentMethods();
            case 'events':
                return renderEventContent();
            case 'help':
                return renderHelpSection();
            default:
                return renderAccountInfo();
        }
    };

    // ============ Account Info =============
    const renderAccountInfo = () => (
        <section className="bg-[#FCFFF7] dark:bg-[#1E1E1E] rounded-xl p-4 sm:p-6 md:p-8 my-4 lg:my-0  border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative shadow-[0_10px_15px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:shadow-[0_12px_15px_rgb(0,0,0,0.6)] dark:hover:shadow-[0_12px_15px_rgb(0,0,0,0.8)]">
            <h2 className="hidden lg:flex text-2xl font-bold text-gray-900 dark:text-white/90 mb-6">
                Informations personnelles
            </h2>
            <form className="space-y-6 lg:space-x-6 lg:grid lg:grid-cols-2" onSubmit={handleUpdateAccount}>
                <FloatingLabelInput id="firstName" label="Prénom" type="text" value={firstName ?? ''} onChange={(e) => setFirstName(e.target.value)} required />
                <FloatingLabelInput id="lastName" label="Nom" type="text" value={lastName ?? ''} onChange={(e) => setLastName(e.target.value)} required />
                <div className=" lg:col-span-2">
                    <FloatingLabelInput id="email" label="Adresse email" type="email" value={email ?? ''} onChange={(e) => setEmail(e.target.value)} required />                    
                </div>
                
                <div className="flex justify-end lg:col-span-2">
                    <ActionButton type="submit" variant="primary" isLoading={isAccountUpdating} className="flex-1 sm:flex-none sm:w-48">
                        <span className="ml-2.5">{isAccountUpdating ? 'Mise à jour' : 'Enregistrer'}</span>
                        {!isAccountUpdating && ( <ChevronUpIcon className="inline-block size-6 ml-2 rotate-90 group-hover:animate-bounce" /> )}
                    </ActionButton>
                </div>
            </form>
        </section>
    );

    // ========= Payment Methods =============
    const renderPaymentMethods = () => (
        session?.user?.id ? <PaymentMethods userId={Number(session.user.id)} /> : null
    );

    // ========= Delete Account =============
    const renderAccountSecurity = () => (
        <section className="bg-white dark:bg-[#1E1E1E] rounded-xl p-1 lg:p-8 mt-4 lg:mt-0 border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative shadow-[0_10px_15px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:shadow-[0_12px_15px_rgb(0,0,0,0.6)] dark:hover:shadow-[0_12px_15px_rgb(0,0,0,0.8)]">
            <h2 className="hidden lg:flex text-2xl font-bold text-gray-900 dark:text-white/90 mb-6">
                Sécurité
            </h2>
            
            <div className="border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <h3 className="text-lg font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
                    <ExclamationTriangleIcon className="size-6" />
                    Zone de danger
                </h3>
                <p className="text-red-700 dark:text-red-400 mt-2 text-sm">
                    La suppression de votre compte est définitive. Toutes vos données, y compris les événements que vous avez créés et vos inscriptions, seront supprimées et ne pourront pas être récupérées.
                </p>
                <div className="mt-4 flex justify-center sm:justify-end">
                    <ActionButton
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        isLoading={isDeletingAccount}
                    >
                        {isDeletingAccount ? <span className="ml-4">Suppression</span> : <><TrashIcon className="size-6 mr-4" /><span> Supprimer mon compte</span></>}
                    </ActionButton>
                </div>
            </div>
        </section>
    );

    // =========== Manage Events =============
    const renderEventContent = () => (
        <EventManagement 
            session={session} 
            openModal={openConfirmationModal} 
            closeModal={closeConfirmationModal}
        />
    );

    // ========= Support =============
    const renderHelpSection = () => (
        <section className="bg-white dark:bg-[#1E1E1E] rounded-xl p-3 sm:p-6 md:p-8 mt-4 lg:mt-0 border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative shadow-[0_10px_15px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:shadow-[0_12px_15px_rgb(0,0,0,0.6)] dark:hover:shadow-[0_12px_15px_rgb(0,0,0,0.8)]">
            <h2 className="text-2xl font-bold hidden lg:flex text-gray-900 dark:text-white/90 mb-6">
                Aide et Support
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
                Pour toute question ou problème, veuillez contacter notre service client.
            </p>
            <div className="flex justify-center sm:justify-end">
                <ActionButton
                    variant="primary"
                    onClick={() => window.location.href = 'mailto:support@eventribe.com'}
                >
                    Contacter le support
                    <PlaneLogo className="group-hover:animate-bounce"/>
                </ActionButton>
            </div>
        </section>
    );



    // ========= Summary Side Bar ===========
    const renderSummarySidebar = () => (
        <aside className="max-md:flex max-md:justify-between lg:col-span-1 bg-white dark:bg-[#1E1E1E] md:rounded-xl max-md:pt-0 p-6 space-y-3 md:p-8 md:border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative md:shadow-lg hover:md:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:md:shadow-[0_10px_12px_rgb(0,0,0,0.5)] dark:hover:md:shadow-[0_12px_15px_rgb(0,0,0,0.8)]">
            <p className="flex justify-between items-baseline  max-md:space-x-4">
                <span className="text-gray-600 dark:text-gray-400">Événements créés </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white/90">{eventCount}</span>
            </p>
            <p className="flex justify-between items-baseline max-md:space-x-4">
                <span className="text-gray-600 dark:text-gray-400">Inscrits </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white/90">{totalRegistered}</span>
            </p>
        </aside>
    );

    // ===== Page Render =====
    return (
        <div className="max-w-[95%] mx-auto">
            {authStatus === 'loading' && (
                <>
                    <p className="text-center text-xl text-gray-700 dark:text-white/70 py-6">Chargement de la session</p>
                    <Loader variant="dots" />
                </>
            )}
            
            {authStatus === 'authenticated' && session && (
                <div className="space-y-8">
                    <div className="md:grid grid-cols-3 lg:grid-cols-4 gap-8 max-md:overflow-hidden max-md:rounded-xl max-md:border border-gray-300 dark:border-white/10 translate-y-0 hover:max-md:-translate-y-1 transform transition-transform duration-700 ease max-md:shadow-lg hover:max-md:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:max-md:shadow-[0_10px_12px_rgb(0,0,0,0.5)] dark:hover:max-md:shadow-[0_12px_15px_rgb(0,0,0,0.8)]">
                        {/* --- head page --- */}
                        <div className="flex space-x-4 md:col-span-2 lg:col-span-3 bg-white dark:bg-[#1E1E1E] md:rounded-xl  p-6 md:p-8 md:border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative md:shadow-lg hover:md:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:md:shadow-[0_10px_12px_rgb(0,0,0,0.5)] dark:hover:md:shadow-[0_12px_15px_rgb(0,0,0,0.8)]">
                            <UserCircleIcon className="hidden min-[475px]:inline-block size-18" />
                            <div className="">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white/90">
                                    Bonjour {session.user.firstName},
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                                    Bienvenue sur votre espace personnel !
                                </p>
                            </div>
                        </div>
                        {renderSummarySidebar()}
                    </div>

                    {/* --- Main container --- */}
                    <div className={`grid grid-cols-1 lg:gap-8 lg:grid ${ isNavCollapsed ? 'lg:grid-cols-[80px_1fr_288px]' : 'lg:grid-cols-[calc(25%)_1fr_calc(25%)]' } transition-all duration-300`}>
                        
                        <aside className={`relative space-y-6 lg:sticky lg:top-10 h-fit ${isNavCollapsed ? 'lg:space-y-0 lg:w-20 bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease-in-out shadow-lg hover:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:shadow-[0_10px_12px_rgb(0,0,0,0.5)] dark:hover:shadow-[0_12px_15px_rgb(0,0,0,0.8)]' : 'lg:w-full'}`}>
                            {renderSidebarNav()}
                        </aside>
                        
                        <main className="hidden lg:block lg:col-span-2 space-y-6">
                            {renderMainContent()}
                        </main>
                    </div>
                </div>
            )}

            <ConfirmationModal isOpen={isModalOpen} message={modalMessage} onConfirm={confirmAction || (() => {})} onCancel={closeConfirmationModal} />
        </div>
    );
}
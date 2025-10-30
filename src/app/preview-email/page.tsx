'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, KeyIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { ChevronUpIcon } from "@heroicons/react/16/solid";
import FloatingLabelInput from "@/app/ui/FloatingLabelInput";
import ActionButton from "@/app/ui/buttons/ActionButton";
import Loader from "@/app/ui/animation/Loader";
import IconButton from "@/app/ui/buttons/IconButton";
import PlaneLogo from '@/app/ui/logo/PlaneLogo';
import IconHomeButton from '@/app/ui/buttons/IconHomeButton';
import { useToast } from '@/app/ui/status/ToastProvider';

import { VerificationCodeEmail } from "@/app/lib/email-templates/VerificationCodeEmail";
import { ConfirmationEmail } from "@/app/lib/email-templates/ConfirmationEmail";
import { UnregisterEmail } from "@/app/lib/email-templates/UnregisterEmail";
import { WelcomeEmail } from "@/app/lib/email-templates/WelcomeEmail";
import { AccountUpdatedEmail } from "@/app/lib/email-templates/AccountUpdatedEmail";
import { AccountDeletedEmail } from "@/app/lib/email-templates/AccountDeletedEmail";
import { EnvelopeIcon, SparklesIcon } from "@heroicons/react/24/solid";
import Footer from '@/app/ui/footer';

type TemplateView = "confirmation" | "unregister" | "verification" | "welcome" | "updateInfo" | "deleteAccount" | null;

export default function PreviewEmailPage() {
    const [activeView, setActiveView] = useState<TemplateView>("confirmation");
    const [isViewLoading, setIsViewLoading] = useState(false);
    const [isNavCollapsed, setIsNavCollapsed] = useState(false);
    const [to, setTo] = useState("");
    const [isSending, setIsSending] = useState(false);

    const { addToast } = useToast();

    const router = useRouter();

    const templates = [
        { key: "confirmation" as const, label: "Confirmation Inscription", icon: CheckCircleIcon },
        { key: "unregister" as const, label: "Confirmation Désinscription", icon: CheckCircleIcon },
        { key: "verification" as const, label: "Code de Vérification", icon: KeyIcon },
        { key: "welcome" as const, label: "Bienvenue sur eventribe", icon: SparklesIcon },
        { key: "updateInfo" as const, label: "Mise à jour du profil", icon: UserCircleIcon },
        { key: "deleteAccount" as const, label: "Suppression du compte", icon: UserCircleIcon },
    ];

    const renderTemplateHTML = () => {
        switch (activeView) {
        case "confirmation":
            return ConfirmationEmail("Cédric", "Ced", "Afterwork Design System");
        case "unregister":
            return UnregisterEmail("Cédric", "Ced", "Afterwork Design System");
        case "verification":
            return VerificationCodeEmail("123456", "eventribe.vercel.app");
        case "welcome":
            return WelcomeEmail("Cédric", "Ced");
        case "updateInfo":
            return AccountUpdatedEmail("Cédric", "Ced");
        case "deleteAccount":
            return AccountDeletedEmail("Cédric", "Ced");
        default:
            return "";
        }
    };

    // const templateTitle =
    //     activeView === "confirmation"
    //     ? "Email de Confirmation"
    //     : activeView === "unregister"
    //     ? "Email de Désinscription"
    //     : activeView === "verification"
    //     ? "Email de Vérification"
    //     : activeView === "welcome"
    //     ? "Email de Bienvenue"
    //     : "Prévisualisation";

    const handleViewChange = (view: TemplateView) => {
        if (window.innerWidth < 1024 && view === activeView) {
            setActiveView(null);
            return;
        }
        setIsViewLoading(true);
        setActiveView(view);
        setTimeout(() => setIsViewLoading(false), 250);
    };

    const handleSend = async () => {
        setIsSending(true);
        const html = renderTemplateHTML();

        try {
            const res = await fetch("/api/send-test-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject: `Test email: ${activeView}`, html, to }),
            });

            if (res.ok) {
                addToast("Email envoyé avec succès", "success");
            } else {
                addToast("Erreur lors de l'envoi", "error");
            }
        } catch {
            addToast("Une erreur réseau est survenue", "error");
        } finally {
            setIsSending(false);
        }
    };

    const renderPreviewCard = () => (
        <section className="bg-white dark:bg-[#1E1E1E] rounded-xl p-1 sm:p-4 my-4 lg:my-0 border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative shadow-[0_10px_15px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:shadow-[0_12px_15px_rgb(0,0,0,0.6)] dark:hover:shadow-[0_12px_15px_rgb(0,0,0,0.8)]">
            <h2 className="hidden lg:flex text-2xl font-bold text-gray-900 dark:text-white/90">
                {/* {templateTitle} */}
            </h2>
            {isViewLoading ? (
                <Loader variant="dots" />
            ) : (
                <div
                    className="border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-gray-900 shadow-inner overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: renderTemplateHTML() }}
                />
            )}
        </section>
    );

    return (
        <>
            {/* --- Header --- */}
            <div className="flex items-center space-x-4 w-[95%] mx-auto my-4 bg-white dark:bg-[#1E1E1E] rounded-xl px-4 py-3 md:py-2 md:px-6 border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative shadow-lg hover:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:shadow-[0_10px_12px_rgb(0,0,0,0.5)] dark:hover:shadow-[0_12px_15px_rgb(0,0,0,0.8)]">
                <EnvelopeIcon className="hidden min-[475px]:inline-block size-22 text-[#08568a]" />
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-[#ff952aff]">
                        Prévisualisation des emails
                    </h1>
                    <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                        Sélectionnez un template et testez son rendu
                    </p>
                </div>
                <IconHomeButton onClick={() => router.push(`/events`)} className="fixed top-6 right-4 cursor-pointer" title="Page d'accueil"/>

            </div>
        

            {/* --- Main container --- */}
            <div
                className={`grid grid-cols-1 lg:gap-8 lg:grid w-[95%] mx-auto my-6 ${
                isNavCollapsed ? "lg:grid-cols-[80px_1fr]" : "lg:grid-cols-[calc(28%)_1fr]"
                } transition-all duration-300`}
            >
                {/* --- SidebarNav --- */}
                <aside
                    className={`space-y-6 dark:text-white/65 ${
                        isNavCollapsed
                        ? "lg:space-y-0 lg:w-20 h-fit bg-white dark:bg-[#1E1E1E] rounded-xl border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative shadow-lg"
                        : "lg:w-full"
                    }`}
                >
                    <section
                        className={`bg-white dark:bg-[#1E1E1E] rounded-xl ${
                        isNavCollapsed
                            ? "p-2"
                            : "p-1 sm:p-8 lg:p-6 border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative shadow-lg"
                        }`}
                    >
                        <div className="relative hidden lg:flex justify-end">
                            <IconButton
                                onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                                title={isNavCollapsed ? "Agrandir" : "Réduire"}
                                className={`bg-transparent p-0 shadow-none hover:bg-transparent overflow-hidden group ${
                                isNavCollapsed ? "-mt-3 -mr-3" : "absolute -top-6 -right-6"
                            }`}
                            >
                                <ChevronUpIcon
                                className={`size-6 dark:text-gray-300 transition-transform duration-900 animate-bounce group-hover:animate-none ${
                                    isNavCollapsed ? "rotate-45" : "rotate-225"
                                }`}
                                />
                            </IconButton>
                        </div>

                        <h3
                            className={`text-lg font-bold text-gray-900 dark:text-[#ff952aff] max-lg:mx-8 max-sm:mt-2 mb-4 ${
                                isNavCollapsed ? "lg:hidden" : ""
                            }`}
                            >
                            Templates email
                        </h3>

                        <nav className="space-y-2">
                            {templates.map(({ key, label, icon: Icon }) => (
                                <div key={key}>
                                <button
                                    onClick={() => handleViewChange(key)}
                                    className={`flex items-center w-full gap-3 px-3 [1024px]:px-0.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                                    activeView === key
                                        ? "bg-[#d9dad9] dark:bg-gray-800 text-gray-800 dark:text-white/90 shadow-lg dark:shadow-[0px_2px_2px_rgba(0,0,0,0.3)]"
                                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    <Icon className={`${isNavCollapsed ? "size-9" : "size-6"} flex-shrink-0 text-[#08568a] dark:text-[#ff952aff]`} />
                                    <span className={isNavCollapsed ? "lg:hidden" : "truncate"}>{label}</span>
                                </button>

                                {/* Mobile preview */}
                                <div className="lg:hidden">
                                    {activeView === key && renderPreviewCard()}
                                </div>
                                </div>
                            ))}
                        </nav>
                    </section>

                    {/* Send email test */}
                    <section
                        className={` rounded-xl ${
                        isNavCollapsed
                            ? "p-2"
                            : "p-3 sm:p-6 mt-4 lg:mt-0 space-y-4 bg-[#FCFFF7] dark:bg-[#1E1E1E] border border-gray-300 dark:border-white/10 translate-y-0 hover:-translate-y-1 transform transition-transform duration-700 ease relative shadow-[0_10px_15px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_15px_rgb(0,0,0,0.3)] dark:shadow-[0_12px_15px_rgb(0,0,0,0.6)] dark:hover:shadow-[0_12px_15px_rgb(0,0,0,0.8)]"
                        }`}
                    >
                        <h3
                            className={`text-lg font-bold text-gray-900 hidden dark:text-[#ff952aff] mb-4 ${
                                isNavCollapsed ? "hidden" : ""
                            }`}
                        >
                            Envoi de test
                        </h3>

                        <form onSubmit={handleSend}>
                            {!isNavCollapsed && (
                                <FloatingLabelInput
                                    id="to"
                                    label="Adresse email de test"
                                    type="email"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    required
                                    className="flex mb-4"
                                />
                            )}

                            <ActionButton
                                type="submit"
                                onClick={handleSend}
                                isLoading={isSending}
                                variant="primary"
                                className={`flex-1 w-full ${isNavCollapsed ? '!p-0 h-12 !rounded-lg' : ''}`}
                            >
                                {isSending ? (
                                    isNavCollapsed ? (
                                        <></>
                                    ) : (
                                        <span className="ml-3">Envoi en cours</span>
                                    )
                                ) : (
                                    isNavCollapsed ? (
                                        <PlaneLogo className="size-9  group-hover:animate-bounce" />
                                    ) : (
                                        <>
                                            <span className="mr-2">Envoyer le template</span>
                                            <PlaneLogo className="group-hover:animate-bounce" />
                                        </>
                                    )
                                )}
                            </ActionButton>
                        </form>
                    </section>
                </aside>

                <main className="hidden lg:block lg:col-span-1">
                    {renderPreviewCard()}
                </main>
            </div>
            <Footer />
        </>
    );
}

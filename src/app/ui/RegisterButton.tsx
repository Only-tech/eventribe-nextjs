'use client';

import { useState } from 'react';
import { registerAction } from '@/app/lib/actions';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function RegisterButton({ userId, eventId }: { userId: string; eventId: number }) {
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setSuccess(false);

    try {
      const result = await registerAction(userId, eventId);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.refresh();
        }, 4000);
      } else {
        setPending(false);
      }
    } catch {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
      <button
        type="submit"
        className={`w-full px-5 py-2 rounded-full text-base font-medium transition-colors border-[0.5px] dark:text-zinc-600 shadow-sm shadow-[hsl(var(--always-black)/5.1%)] ${success ? 'bg-green-300' : 'bg-[#F0EEE5]'} hover:bg-[#E8E5D8] hover:border-transparent duration-300 ease-in-out cursor-pointer`}
        disabled={pending}
      >
        {pending ? (
          <>
            <span>{success ? 'Inscription réussie !' : 'Inscription'}</span>
            {!success && (
              <svg viewBox="0 0 50 50" className="inline-block w-6 h-6 ml-3">
                <circle cx="25" cy="25" r="20" stroke="#ff952aff" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="30 70">
                  <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" from="0 25 25" to="360 25 25" />
                </circle>
              </svg>
            )}
          </>
        ) : (
          <>
            <span>S'inscrire</span>
            <PlusIcon className="inline-block w-4 h-4 group-hover:animate-bounce ml-2" />
          </>
        )}
      </button>
    </form>
  );
}

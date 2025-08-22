'use client';

import { useSearchParams } from 'next/navigation';

export function LoginParamsMessage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  if (!redirect) return null;

  return (
    <div className="mb-4 text-sm text-gray-500 text-center">
      Vous serez redirigé vers <strong>{redirect}</strong> après connexion.
    </div>
  );
}

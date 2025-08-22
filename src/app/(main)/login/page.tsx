import { Suspense } from 'react';
import Link from 'next/link';
import LoginForm from './LoginForm';
import { LoginParamsMessage } from './LoginParamsMessage';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto bg-[rgb(248,248,236)] p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Connexion</h1>

      <Suspense fallback={null}>
        <LoginParamsMessage />
      </Suspense>

      <LoginForm />

      <p className="mt-6 text-center text-gray-600">
        Pas encore de compte ?{' '}
        <Link href="/register" className="text-indigo-600 hover:underline">
          Inscrivez-vous ici
        </Link>
        .
      </p>
    </div>
  );
}

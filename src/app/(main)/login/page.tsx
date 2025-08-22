'use client'; 

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Suspense } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(''); // Clear previous messages

    try {
      // Use signIn from next-auth/react
      const result = await signIn('credentials', {
        redirect: false, // Prevent NextAuth from redirecting automatically
        email,
        password,
      });

      if (result?.error) {
        // Handle login error
        setMessage('Email ou mot de passe incorrect.');
        setIsSuccess(false);
      } else {
        // Login successful
        setMessage('Connexion réussie. Redirection...');
        setIsSuccess(true);
        // Redirect to home page on successful login
        setTimeout(() => {
          router.push('/');
        }, 1500);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire de connexion:', error);
      setMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
      setIsSuccess(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[rgb(248,248,236)] p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Connexion</h1>

      {/* Show error message if a callbackUrl is present */}
      {searchParams.get('error') && (
        <p className="text-red-600 bg-red-100 text-center font-semibold p-3 rounded-lg mb-4">
          Une erreur est survenue lors de la connexion.
        </p>
      )}
      
      {message && (
        <p className={`mb-4 text-center font-semibold p-3 rounded-lg ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email :</label>
          <input
            type="email"
            id="email"
            name="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff952aff] focus:border-[#ff952aff] sm:text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe :</label>
          <input
            type="password"
            id="password"
            name="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff952aff] focus:border-[#ff952aff] sm:text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-5 py-2 rounded-full text-base font-medium transition-colors border-[0.5px] shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-[#F0EEE5] hover:bg-[#E8E5D8] hover:border-transparent duration-300 ease-in-out cursor-pointer"
        >
          Se connecter
        </button>
      </form>
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



// Wrap the client component with a Suspense boundary in the server component
export default function LoginPage() {
  return (
      <Suspense fallback={<div>Chargement du formulaire...</div>}>
        <LoginForm />
      </Suspense>    
  );
}
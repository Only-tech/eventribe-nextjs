'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(''); // Clear previous messages

    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      setIsSuccess(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, confirm_password: confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsSuccess(true);
        // Redirect to login page after successful registration
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setMessage(data.message || "Erreur d'inscription. Veuillez réessayer.");
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire d\'inscription:', error);
      setMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
      setIsSuccess(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[rgb(248,248,236)] p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Inscription</h1>

      {message && (
        <div className={`mb-4 text-center font-semibold p-3 rounded-lg ${isSuccess ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Nom d&apos;utilisateur :</label>
          <input
            type="text"
            id="username"
            name="username"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff952aff] focus:border-[#ff952aff] sm:text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
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
        <div className="mb-4">
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
        <div className="mb-6">
          <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">Confirmer le mot de passe :</label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff952aff] focus:border-[#ff952aff] sm:text-sm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2 rounded-full text-base font-medium transition-colors group border-[0.5px] shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-[#F0EEE5] hover:bg-[#E8E5D8] hover:border-transparent duration-300 ease-in-out cursor-pointer w-full"
        >
          S&apos;inscrire&nbsp;
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
            viewBox="0 0 256 256" className="inline-block -translate-y-0.5 group-hover:animate-bounce">
            <path d="M136 120h56a8 8 0 0 1 0 16h-56v56a8 8 0 0 1-16 0v-56H64a8 8 0 0 1 0-16h56V64a8 8 0 0 1 16 0v56z" />
          </svg>
        </button>
      </form>
      <p className="mt-6 text-center text-gray-600">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-indigo-600 hover:underline">
          Connectez-vous ici
        </Link>
        .
      </p>
    </div>
  );
}

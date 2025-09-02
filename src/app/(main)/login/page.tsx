'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import FloatingLabelInput from '@/app/ui/FloatingLabelInput';
import { EyeIcon, EyeSlashIcon, FingerPrintIcon } from '@heroicons/react/24/outline';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(''); 

    try {
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
          router.push('/events');
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
      <h1 className="flex items-center justify-center text-3xl font-bold text-gray-900 mb-8">
          <FingerPrintIcon className="w-8 h-8 mr-2" />
          <span>Connexion</span>
      </h1>

      {message && (
        <div className={`mb-4 text-center font-semibold p-3 rounded-lg ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {message}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <FloatingLabelInput
          id="email"
          label="Adresse email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="relative">
          <FloatingLabelInput
            label="Mot de passe"
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10" 
          />
          <button
            type="button" // Important to unsubmit the form
            onClick={() => setShowPassword(!showPassword)} 
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 cursor-pointer"
            aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
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

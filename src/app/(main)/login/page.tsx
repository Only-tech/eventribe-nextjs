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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(''); 

    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false, // Prevent NextAuth from redirecting automatically
        email,
        password,
      });

      if (result?.error) {
        // Handle login error
        setLoading(false);
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
    <div className="max-w-md mx-auto bg-gray-300 dark:bg-white/15 p-[0.5px] hover:bg-gray-600 dark:hover:bg-white/70 rounded-lg shadow-2xl transition-all duration-300 ease-in-out" style={{ clipPath: "var(--clip-path-squircle-60)" }}>
    <div className="bg-[rgb(248,248,236)] dark:bg-[#1E1E1E] dark:text-white p-8 rounded-lg" style={{ clipPath: "var(--clip-path-squircle-60)" }}>
      <h1 className="flex flex-col items-center justify-center text-3xl font-bold text-gray-900 dark:text-white mb-8">
          <FingerPrintIcon className="w-auto h-16  mb-4" />
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
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 cursor-pointer"
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
          className="w-full px-5 py-2 rounded-full text-base font-medium transition-colors border-[0.5px] dark:text-zinc-600 shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-[#F0EEE5] hover:bg-[#E8E5D8] hover:border-transparent duration-300 ease-in-out cursor-pointer"
           disabled={loading}
            >
              {loading ? (
                <>
                  <span>Connexion</span>
                  <svg viewBox="0 0 50 50" className="inline-block w-6 h-6 ml-2">
                    <circle cx="25" cy="25" r="20" stroke="#ff952aff" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="30 70">
                      <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" from="0 25 25" to="360 25 25" />
                    </circle>
                  </svg>
                </>
              ) : (
                <>
                  <span>Se connecter</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" className="inline-block w-4 h-4 group-hover:animate-bounce ml-2">
                    <path d="M205.66,149.66l-72,72a8,8,0,0,1-11.32,0l-72-72a8,8,0,0,1,11.32-11.32L120,196.69V40a8,8,0,0,1,16,0V196.69l58.34-58.35a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </>
              )}
        </button>
      </form>
      <p className="mt-6 text-center text-gray-700 dark:text-gray-500">
        Pas encore de compte ?{' '}
        <Link href="/register" className="text-indigo-600 hover:underline">
          Inscrivez-vous ici
        </Link>
        .
      </p>
    </div>
    </div>
  );
}

'use client'; 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FloatingLabelInput from '@/app/ui/FloatingLabelInput';
import { EyeIcon, EyeSlashIcon, FingerPrintIcon, PlusIcon } from '@heroicons/react/24/outline';



export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
    // const [formStatus, setFormStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  // Clean status
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [message]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(''); // Clear previous messages

    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.');
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    setLoading(true);

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
        setLoading(false);
         setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setMessage(data.message || "Erreur d'inscription. Veuillez réessayer.");
        setIsSuccess(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire d\'inscription:', error);
      setMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
      setIsSuccess(false);
      setLoading(false);
    }
  };

  return (
    <div className="drop-shadow-lg max-w-md mx-auto transform transition-transform duration-300 hover:drop-shadow-2xl group dark:hover:drop-shadow-[0px_1px_5px_rgba(255,_255,_255,_0.4)] dark:drop-shadow-[0px_1px_1px_rgba(255,_255,_255,_0.2)]">
    <div className="bg-[rgb(248,248,236)] dark:bg-[#1E1E1E] dark:text-white p-8 rounded-lg" style={{ clipPath: "var(--clip-path-squircle-60)" }}>      
      <h1 className="flex flex-col items-center justify-center text-3xl font-bold text-gray-900 dark:text-white mb-8">
          <FingerPrintIcon className="w-auto h-16  mb-4" />
          <span>Inscription</span>
      </h1>

      {message && (
        <div className={`mb-4 text-center font-semibold p-3 rounded-lg ${isSuccess ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
          {message}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <FloatingLabelInput
          label="Nom d'utilisateur"
          type="text"
          id="username"
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
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
            type="button" 
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
        <div className="relative">
          <FloatingLabelInput
            label="Confirmer le mot de passe"
            type={showPassword ? 'text' : 'password'}
            id="confirm_password"
            name="confirm_password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="pr-10" 
          />
          <button
            type="button" 
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
          className="h-11 inline-flex items-center justify-center px-5 py-2 rounded-full text-base font-medium transition-colors group border-[0.5px] dark:text-zinc-600 shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-[#F0EEE5] hover:bg-[#E8E5D8] hover:border-transparent duration-300 ease-in-out cursor-pointer w-full"
           disabled={loading}
        >
          {loading ? (
          <>
            <span>Inscription</span>
            <svg viewBox="0 0 50 50" className="inline-block w-6 h-6 ml-2">
              <circle cx="25" cy="25" r="20" stroke="#ff952aff" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="30 70">
                <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" from="0 25 25" to="360 25 25" />
              </circle>
            </svg>
          </>
        ) : (
          <>
          <span>S&apos;inscrire</span>
          <PlusIcon className="h-4 w-4 ml-2 group-hover:animate-bounce"/>
          </>
        )}
        </button>
      </form>
      <p className="mt-6 text-center text-gray-700 dark:text-gray-500">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-indigo-600 hover:underline">
          Connectez-vous ici
        </Link>
        .
      </p>
    </div>
    </div>
  );
}

'use client'; 

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // <-- Import useSearchParams
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import React from 'react';

// A client component to handle the login form logic.
// The searchParams prop has been removed from the function signature.
export default function LoginPage() {
  const searchParams = useSearchParams(); // <-- Use the hook here
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  // Get the error message from the URL search parameters
  const error = searchParams.get('error');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(''); // Clear previous messages

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setMessage('Email ou mot de passe incorrect.');
        setIsSuccess(false);
      } else {
        setMessage('Connexion réussie. Redirection...');
        setIsSuccess(true);
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
        <h2 className="text-3xl font-bold text-center mb-4">Connexion</h2>
        <p className="text-center text-gray-600 mb-6">Connectez-vous pour accéder à votre compte.</p>
        
        {/* Check for the error from the URL */}
        {error && (
          <p className="text-red-500 mb-4">
            Une erreur est survenue lors de la connexion.
          </p>
        )}

        {message && (
          <p className={`text-center mb-4 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col items-center">
          <div className="mb-4 w-full">
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
          <div className="mb-6 w-full">
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
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Pas encore de compte ?
            <Link href="/register" className="ml-1 text-indigo-600 hover:underline">
              Inscrivez-vous ici
            </Link>
          </p>
        </div>
      </div>
  );
}




// 'use client'; 

// import { useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import { signIn } from 'next-auth/react';
// import { Suspense } from 'react';

// function LoginForm() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [message, setMessage] = useState('');
//   const [isSuccess, setIsSuccess] = useState(false);
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setMessage(''); // Clear previous messages

//     try {
//       // Use signIn from next-auth/react
//       const result = await signIn('credentials', {
//         redirect: false, // Prevent NextAuth from redirecting automatically
//         email,
//         password,
//       });

//       if (result?.error) {
//         // Handle login error
//         setMessage('Email ou mot de passe incorrect.');
//         setIsSuccess(false);
//       } else {
//         // Login successful
//         setMessage('Connexion réussie. Redirection...');
//         setIsSuccess(true);
//         // Redirect to home page on successful login
//         setTimeout(() => {
//           router.push('/');
//         }, 1500);
//       }
//     } catch (error) {
//       console.error('Erreur lors de la soumission du formulaire de connexion:', error);
//       setMessage('Une erreur est survenue. Veuillez réessayer plus tard.');
//       setIsSuccess(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto bg-[rgb(248,248,236)] p-8 rounded-lg shadow-lg">
//       <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Connexion</h1>

//       {/* Show error message if a callbackUrl is present */}
//       {searchParams.get('error') && (
//         <p className="text-red-600 bg-red-100 text-center font-semibold p-3 rounded-lg mb-4">
//           Une erreur est survenue lors de la connexion.
//         </p>
//       )}
      
//       {message && (
//         <p className={`mb-4 text-center font-semibold p-3 rounded-lg ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
//           {message}
//         </p>
//       )}

//       <form onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email :</label>
//           <input
//             type="email"
//             id="email"
//             name="email"
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff952aff] focus:border-[#ff952aff] sm:text-sm"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </div>
//         <div className="mb-6">
//           <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe :</label>
//           <input
//             type="password"
//             id="password"
//             name="password"
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#ff952aff] focus:border-[#ff952aff] sm:text-sm"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </div>
//         <button
//           type="submit"
//           className="w-full px-5 py-2 rounded-full text-base font-medium transition-colors border-[0.5px] shadow-sm shadow-[hsl(var(--always-black)/5.1%)] bg-[#F0EEE5] hover:bg-[#E8E5D8] hover:border-transparent duration-300 ease-in-out cursor-pointer"
//         >
//           Se connecter
//         </button>
//       </form>
//       <p className="mt-6 text-center text-gray-600">
//         Pas encore de compte ?{' '}
//         <Link href="/register" className="text-indigo-600 hover:underline">
//           Inscrivez-vous ici
//         </Link>
//         .
//       </p>
//     </div>
//   );
// }



// // Wrap the client component with a Suspense boundary in the server component
// export default function LoginPage() {
//   return (
//       <Suspense fallback={<div>Chargement du formulaire...</div>}>
//         <LoginForm />
//       </Suspense>    
//   );
// }
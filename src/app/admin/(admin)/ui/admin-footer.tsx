'use client'; 


export default function AdminFooter() {

  return (
    <footer className="bg-gray-900 text-white py-4 mt-auto w-full">
      <div className="container text-center text-sm mx-auto">
        All rights reserved. Cédrick &copy; {new Date().getFullYear()} eventribe
      </div>
    </footer>
  );
}

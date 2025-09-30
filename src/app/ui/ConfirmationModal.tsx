'use client';

import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({ isOpen, message, onConfirm, onCancel }: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#f5f5dc]/65 dark:bg-[#222222]/65 backdrop-blur-sm flex items-center justify-center z-10000 transition-opacity duration-500 ease-in-out">
      <div className="bg-[rgb(248,248,236)] dark:bg-[#1E1E1E] border border-gray-300 dark:border-white/20 rounded-xl drop-shadow-2xl max-w-lg w-full p-6 lg:p-10 group transition-all ease-in-out duration-500 translate-y-0 opacity-100 animate-slide-up mx-4 dark:hover:drop-shadow-[0px_1px_1px_rgba(255,_255,_255,_0.4)] dark:drop-shadow-[0px_15px_15px_rgba(0,0,0,_0.6)]">
        <p className="text-base font-semibold text-gray-800 dark:text-white/70 mb-8 leading-8 text-center">{message}</p>
        <div className="flex justify-center pt-6 border-t border-gray-300 dark:border-white/20 gap-4">
          <button
            onClick={onCancel}
            className="w-32 flex-1 px-5 py-2 rounded-full text-base text-gray-800 dark:text-white/70 dark:hover:text-gray-700 font-medium transition-colors border-[0.5px] border-gray-300 dark:border-white/20 shadow-sm hover:bg-gray-100 duration-300 ease-in-out cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="w-32 flex-1 px-5 py-2 rounded-full text-base text-white hover:text-gray-700 font-medium transition-colors bg-red-600 hover:bg-gray-100 shadow-sm duration-300 ease-in-out cursor-pointer"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

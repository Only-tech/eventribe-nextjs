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
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[rgb(248,248,236)] dark:bg-zinc-900 dark:text-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-300 mb-6 text-center">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="w-32 px-5 py-2 rounded-full text-base text-gray-800 dark:text-gray-200 dark:hover:text-gray-700 font-medium transition-colors border-[0.5px] border-gray-300 shadow-sm hover:bg-gray-100 duration-300 ease-in-out cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="w-32 px-5 py-2 rounded-full text-base text-white font-medium transition-colors bg-red-600 hover:bg-red-700 shadow-sm duration-300 ease-in-out cursor-pointer"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

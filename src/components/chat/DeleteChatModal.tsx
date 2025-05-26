// src/components/chat/DeleteChatModal.tsx
"use client";

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { FiX, FiTrash2, FiLoader, FiAlertTriangle } from 'react-icons/fi'; // Icons

interface DeleteChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>; // Make confirm async
  chatTitle: string;
  isDeleting: boolean; // Pass deleting state
}

export default function DeleteChatModal({
  isOpen,
  onClose,
  onConfirmDelete,
  chatTitle,
  isDeleting,
}: DeleteChatModalProps) {

  const handleDeleteConfirm = async () => {
      try {
          await onConfirmDelete(); // Call the async delete function
          // onClose(); // Optionally close modal here, or let parent handle it after state update
      } catch (error) {
          console.error("Deletion failed from modal:", error);
          // Error handled in parent component where state is managed
      }
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        {/* Overlay */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Content */}
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
            "gap-4 border border-neutral-700 bg-neutral-900 p-6 shadow-xl duration-200 rounded-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          )}
          onEscapeKeyDown={onClose} // Close on Escape key
        >
          {/* Header */}
          <div className="flex flex-col space-y-1.5 text-center sm:text-left">
            <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight text-white flex items-center gap-2">
               <FiAlertTriangle className="text-red-500 w-5 h-5" /> Delete Chat Confirmation
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-sm text-neutral-400 mt-1">
              Are you absolutely sure you want to delete the chat titled: <br />
              <strong className="text-neutral-200 break-all">"{chatTitle}"</strong>?
              <br /> This action cannot be undone.
            </DialogPrimitive.Description>
          </div>

          {/* Footer with Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 pt-4 mt-4 border-t border-neutral-800">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className={cn(
                  "mt-2 sm:mt-0 inline-flex h-9 items-center justify-center rounded-md border border-neutral-700 bg-transparent px-4 py-2 text-sm font-medium text-neutral-300 shadow-sm transition-colors hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-600 disabled:pointer-events-none disabled:opacity-50"
              )}
            >
              Cancel
            </button>
            {/* Confirm Delete Button */}
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className={cn(
                  "inline-flex h-9 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-700 disabled:pointer-events-none disabled:opacity-50"
              )}
            >
              {isDeleting ? (
                <FiLoader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FiTrash2 className="w-4 h-4 mr-2" />
              )}
              {isDeleting ? 'Deleting...' : 'Yes, Delete Chat'}
            </button>
          </div>

           {/* Optional: Close Button */}
           {/* <DialogPrimitive.Close
              onClick={onClose}
              disabled={isDeleting}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <FiX className="h-4 w-4 text-neutral-500" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close> */}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
// src/components/goals/DeleteGoalDialog.tsx
"use client";

import React from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose // Import base components
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // Import your Button component
import { FiAlertTriangle, FiTrash2, FiLoader } from "react-icons/fi";

interface DeleteGoalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void; // Callback when delete is confirmed
  goalTitle: string;
  isDeleting: boolean; // Loading state for the confirm button
}

export default function DeleteGoalDialog({
  isOpen,
  onOpenChange,
  onConfirmDelete,
  goalTitle,
  isDeleting
}: DeleteGoalDialogProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]"> {/* Adjust max width */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive"> {/* Use destructive color */}
             <FiAlertTriangle className="w-5 h-5" /> Delete Goal
          </DialogTitle>
          <DialogDescription className="text-left pt-2 text-muted-foreground">
            Are you absolutely sure you want to delete the goal <strong className="text-foreground">"{goalTitle || 'this goal'}"</strong>?
            This action cannot be undone and all associated data will be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-4"> {/* Added gap */}
           {/* Use DialogClose for the Cancel button for accessibility */}
          <DialogClose asChild>
             <Button variant="secondary" size="sm" disabled={isDeleting}>Cancel</Button>
          </DialogClose>
          <Button
            variant="destructive" // Destructive variant for delete action
            size="sm"
            disabled={isDeleting}
            onClick={onConfirmDelete} // Call the confirm handler
          >
            {isDeleting ? <FiLoader className="animate-spin w-4 h-4 mr-1.5"/> : <FiTrash2 className="w-4 h-4 mr-1.5" />}
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
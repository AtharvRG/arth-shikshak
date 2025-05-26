// src/components/chat/SuggestionButton.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface SuggestionButtonProps {
    text: string;
    onClick: () => void;
}

export default function SuggestionButton({ text, onClick }: SuggestionButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800/60 hover:bg-neutral-700/80",
                "text-xs text-neutral-300 font-medium transition-colors"
            )}
        >
            {text}
        </button>
    );
}
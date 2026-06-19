'use client';

import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useTextToSpeech } from '@/hooks';

interface SpeakerButtonProps {
  word: string;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  iconClassName?: string;
  onClick?: () => void;
}

export function SpeakerButton({ 
  word, 
  className = '', 
  activeClassName = 'text-primary-600 bg-primary-50 animate-pulse',
  inactiveClassName = 'text-slate-400 hover:text-primary-600 hover:bg-slate-50',
  iconClassName = 'w-4 h-4',
  onClick
}: SpeakerButtonProps) {
  const { speak, speakingWord } = useTextToSpeech();
  const [playCount, setPlayCount] = useState(0);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!word) return;
    const rate = playCount % 2 === 0 ? 1.0 : 0.5;
    speak(word, { rate });
    setPlayCount(prev => prev + 1);
    if (onClick) onClick();
  };

  const isActive = speakingWord === word;
  
  const baseClass = "transition-all flex-shrink-0 cursor-pointer focus:outline-none flex items-center justify-center";
  const appliedClass = `${baseClass} ${className} ${isActive ? activeClassName : inactiveClassName}`;

  return (
    <button
      onClick={handleSpeak}
      className={appliedClass.trim()}
      aria-label="Listen pronunciation"
      title={playCount % 2 === 0 ? 'Listen (Normal speed)' : 'Listen (Slow speed)'}
    >
      <Volume2 className={iconClassName} />
    </button>
  );
}

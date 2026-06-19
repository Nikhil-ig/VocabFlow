'use client';

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Loader2 } from 'lucide-react';
import { apiClient } from '@/services/api';
import { SpeakerButton } from './SpeakerButton';
import { useAuth } from '@/contexts/AuthContext';
import { useVocabStore } from '@/lib/store';
import { HistoryAction } from '@/types';

interface WordOfTheDay {
  word: string;
  meaning: string;
  example?: string;
  pos?: string;
  pronunciation?: string;
  cardId?: string;
}

export function WordOfTheDayScratchCard() {
  const [wordData, setWordData] = useState<WordOfTheDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);
  const { user } = useAuth();
  const isGuest = !user;
  const boardColumns = useVocabStore((state) => state.boardColumns);
  const setNotification = useVocabStore((state) => state.setNotification);

  useEffect(() => {
    const fetchWord = async () => {
      const response = await apiClient.getWordOfTheDay();
      if (response.success && response.data) {
        setWordData(response.data);
      }
      setLoading(false);
    };
    fetchWord();
  }, []);

  useEffect(() => {
    if (!wordData || revealed || loading) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas size to match container
    const resizeCanvas = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      
      // Premium Gold / Holographic foil gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#bf953f');
      gradient.addColorStop(0.25, '#fcf6ba');
      gradient.addColorStop(0.5, '#b38728');
      gradient.addColorStop(0.75, '#fbf5b7');
      gradient.addColorStop(1, '#aa771c');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add a subtle overlay pattern (diagonal lines)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      for (let i = -canvas.height; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + canvas.height, canvas.height);
        ctx.stroke();
      }

      // Add premium text
      ctx.fillStyle = '#6b4c10';
      ctx.font = '800 28px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Text Shadow for engraved effect
      ctx.shadowColor = 'rgba(255,255,255,0.6)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      ctx.fillText('✨ SCRATCH & REVEAL ✨', canvas.width / 2, canvas.height / 2);
      
      // Reset shadow for scratching
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [wordData, revealed, loading]);

  const scratch = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !isDrawing.current) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    checkPercentageScratched();
  };

  const startScratch = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    scratch(e);
  };

  const stopScratch = () => {
    isDrawing.current = false;
  };

  const checkPercentageScratched = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparentPixels = 0;

    // Check every 4th byte (alpha channel)
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    const totalPixels = pixels.length / 4;
    const percentage = (transparentPixels / totalPixels) * 100;

    // Reveal earlier for a satisfying "Google Pay" style experience
    if (percentage > 8 && !revealed) {
      triggerReveal();
    }
  };

  const triggerReveal = () => {
    setRevealed(true);
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ffd700', '#ff8c00', '#ff1493', '#00ced1', '#8a2be2'],
      disableForReducedMotion: true
    });
  };

  const handleAddToLearning = async () => {
    if (!wordData?.cardId || isGuest) return;
    
    const learningCol = boardColumns.find(c => c.name.toLowerCase().includes('learn') && !c.name.toLowerCase().includes('to')) || boardColumns[1];
    if (!learningCol) return;
    
    try {
      let response;
      if (user?.role === 'ADMIN') {
        response = await apiClient.updateCard(wordData.cardId, { columnId: learningCol.id });
      } else {
        response = await apiClient.recordHistory(wordData.cardId, { newStatus: learningCol.id, action: HistoryAction.STATUS_CHANGED });
      }

      if (response.success) {
        setNotification({ message: 'Added to your Learning list!', type: 'success' });
      }
    } catch (err) {
      setNotification({ message: 'Failed to update status', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="w-full h-48 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!wordData) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes premium-entry {
          0% {
            opacity: 0;
            transform: translateY(120px) rotate(-6deg) scale(0.9);
            filter: blur(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotate(0deg) scale(1);
            filter: blur(0);
          }
        }
        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        @keyframes foil-shine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .animate-premium-entry {
          animation: premium-entry 1.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .animate-float {
          animation: float-gentle 4s ease-in-out infinite;
        }
        .foil-text {
          background: linear-gradient(
            to right,
            #bf953f 20%,
            #fcf6ba 40%,
            #b38728 60%,
            #bf953f 80%
          );
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: foil-shine 4s linear infinite;
        }
      `}</style>
      <div className="relative w-full rounded-3xl overflow-hidden border border-amber-200/50 shadow-2xl shadow-amber-900/10 bg-white mb-6 group animate-premium-entry hover:shadow-amber-900/20 transition-all duration-700">
        {/* The content underneath */}
        <div 
          ref={containerRef}
          className="relative p-6 sm:p-8 bg-gradient-to-br from-amber-50 via-white to-amber-50/30 min-h-[220px] flex flex-col justify-center select-none"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-multiply pointer-events-none"></div>
          <div className="flex items-center space-x-2 text-amber-600 mb-3 relative z-10">
            <Sparkles className="w-5 h-5 animate-pulse text-amber-500" />
            <span className="text-sm font-bold uppercase tracking-widest foil-text">Daily Reward</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-3 relative z-10 animate-float">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 capitalize drop-shadow-sm tracking-tight flex items-center gap-3">
              {wordData.word}
              <SpeakerButton 
                word={wordData.word}
                className="p-2 rounded-full flex-shrink-0"
                activeClassName="bg-amber-200 text-amber-700"
                inactiveClassName="bg-slate-100 text-slate-400 hover:bg-amber-100 hover:text-amber-600"
                iconClassName="w-6 h-6"
              />
            </h2>
            {(wordData.pronunciation || wordData.pos) && (
              <span className="text-sm font-bold text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full shadow-inner border border-amber-200/50">
                {wordData.pronunciation && `/${wordData.pronunciation}/ `} {wordData.pos && `• ${wordData.pos}`}
              </span>
            )}
          </div>
          
          <p className="text-slate-700 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl relative z-10 mt-2">
            {wordData.meaning}
          </p>
          
          {wordData.example && (
            <p className="mt-5 text-slate-600 font-medium italic text-sm sm:text-base border-l-4 border-amber-300 pl-4 bg-amber-50/50 py-3 pr-4 rounded-r-xl relative z-10 shadow-sm">
              "{wordData.example}"
            </p>
          )}

          {revealed && !isGuest && wordData.cardId && (
            <button
              onClick={handleAddToLearning}
              className="mt-6 self-start px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_20px_rgba(245,158,11,0.6)] font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 relative z-10"
            >
              Start Learning
            </button>
          )}
        </div>

        {/* The scratchable canvas layer */}
        <canvas
          ref={canvasRef}
          onMouseDown={startScratch}
          onMouseMove={scratch}
          onMouseUp={stopScratch}
          onMouseLeave={stopScratch}
          onTouchStart={startScratch}
          onTouchMove={scratch}
          onTouchEnd={stopScratch}
          className={`absolute inset-0 w-full h-full z-20 touch-none transition-all duration-[1200ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            revealed 
              ? 'opacity-0 scale-[1.15] pointer-events-none filter blur-md' 
              : 'opacity-100 hover:opacity-[0.99] cursor-crosshair'
          }`}
        />
      </div>
    </>
  );
}

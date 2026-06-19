'use client';

import { useEffect } from 'react';

// Rough utility to lighten/darken a hex color
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function adjustColor(rgb: {r: number, g: number, b: number}, factor: number) {
  // factor > 1 lightens, factor < 1 darkens
  return {
    r: Math.min(255, Math.max(0, Math.round(rgb.r * factor))),
    g: Math.min(255, Math.max(0, Math.round(rgb.g * factor))),
    b: Math.min(255, Math.max(0, Math.round(rgb.b * factor)))
  };
}

interface ThemeInjectorProps {
  primaryColor?: string | null;
}

export default function ThemeInjector({ primaryColor }: ThemeInjectorProps) {
  useEffect(() => {
    if (!primaryColor) return;

    const baseRgb = hexToRgb(primaryColor);
    if (!baseRgb) return;

    const root = document.documentElement;
    
    // Generate rough shades
    const shades = {
      50: adjustColor(baseRgb, 1.9),
      100: adjustColor(baseRgb, 1.8),
      200: adjustColor(baseRgb, 1.6),
      300: adjustColor(baseRgb, 1.4),
      400: adjustColor(baseRgb, 1.2),
      500: baseRgb,
      600: adjustColor(baseRgb, 0.9),
      700: adjustColor(baseRgb, 0.75),
      800: adjustColor(baseRgb, 0.6),
      900: adjustColor(baseRgb, 0.45),
      950: adjustColor(baseRgb, 0.3),
    };

    Object.entries(shades).forEach(([shade, rgb]) => {
      root.style.setProperty(`--color-primary-${shade}`, `${rgb.r} ${rgb.g} ${rgb.b}`);
    });

  }, [primaryColor]);

  return null;
}

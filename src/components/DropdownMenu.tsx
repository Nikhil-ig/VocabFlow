'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

interface DropdownItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

interface DropdownMenuProps {
  items: DropdownItem[];
}

export function DropdownMenu({ items }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${
          isOpen ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:text-primary-600 hover:bg-slate-50'
        }`}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl border border-slate-100 rounded-2xl shadow-xl z-[60] overflow-hidden transform origin-top-right animate-scale-up">
          <div className="py-2 flex flex-col">
            {items.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={`flex items-center w-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                  item.destructive
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-slate-600 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

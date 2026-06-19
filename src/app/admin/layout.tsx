'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, Columns, LogOut, Settings, ShieldAlert } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, status } = useAuth();
  const session = user ? { user } : null;
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'SUPERADMIN') {
      router.push('/app');
    }
  }, [status, session, router]);

  if (status === 'loading' || (session && session.user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <ShieldAlert className="w-12 h-12 text-primary-300 mb-4" />
          <p className="text-slate-500 font-bold">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Column Manager', href: '/admin/columns', icon: Columns },
    { name: 'White-Label Branding', href: '/admin/branding', icon: Settings },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        <div className="p-6">
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <span>Admin Control</span>
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest">
            VocabFlow System
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                  isActive 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm' 
                    : 'hover:bg-slate-800 hover:text-white border border-transparent'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-rose-400' : 'text-slate-500'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => router.push('/app')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors font-bold text-sm text-slate-400 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
            <span>Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
        {/* Top Header Background Decor */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-primary-900/10 to-transparent pointer-events-none" />
        
        <div className="relative flex-1 p-6 md:p-10 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

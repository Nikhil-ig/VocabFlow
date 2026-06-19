'use client';

import { useEffect, useState } from 'react';
import { Users, Layers, Layout, Activity, ChevronRight, Clock } from 'lucide-react';
import { apiClient } from '@/services/api';

interface AdminStats {
  totalUsers: number;
  totalCards: number;
  totalColumns: number;
  recentCards: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await (apiClient as any).client.get('/admin/stats');
        const data = res.data;
        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.error);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 text-red-500 p-6 rounded-2xl shadow-sm border border-red-100">
        <h3 className="font-bold text-lg mb-2">Failed to Load Dashboard</h3>
        <p>{error}</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary-500', bg: 'bg-primary-50' },
    { label: 'Vocabulary Cards', value: stats.totalCards, icon: Layers, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Active Columns', value: stats.totalColumns, icon: Layout, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1 font-medium">Real-time statistics for the VocabFlow platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-6 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-2xl ${stat.bg}`}>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-4xl font-black text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-bold text-slate-800">Recent Card Activity</h2>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {stats.recentCards.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-medium">No recent activity.</div>
          ) : (
            stats.recentCards.map((card) => (
              <div key={card.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                    {card.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg">
                      {card.word}
                    </p>
                    <p className="text-sm text-slate-500 flex items-center mt-1">
                      <span className="font-medium">{card.user?.name || card.user?.email}</span>
                      <span className="mx-2">•</span>
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(card.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {card.column && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      card.column.color.includes('text') 
                        ? card.column.color 
                        : 'text-slate-600 bg-slate-100 border-slate-200'
                    }`}>
                      {card.column.name}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-400 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

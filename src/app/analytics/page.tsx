'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Star, Flame, User, Brain, Target, Clock, Sparkles, Activity } from 'lucide-react';
import { apiClient } from '@/services/api';
import { UserStatistics, Recommendation } from '@/types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function AnalyticsDashboard() {
  const { user, status } = useAuth();
  const session = user ? { user } : null;
  const router = useRouter();
  
  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<{partOfSpeech: any[], status: any[]}>({partOfSpeech: [], status: []});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      const loadData = async () => {
        try {
          const [statsResponse, recResponse, activityResponse, distResponse] = await Promise.all([
            apiClient.getUserStatistics(),
            apiClient.getRecommendations(),
            apiClient.getActivity(7),
            apiClient.getDistribution()
          ]);
          
          if (statsResponse.success && statsResponse.data) {
            setStats(statsResponse.data);
          }
          if (recResponse.success && recResponse.data) {
            setRecommendations(recResponse.data);
          }
          if (activityResponse.success && activityResponse.data) {
            setActivityData(activityResponse.data);
          }
          if (distResponse.success && distResponse.data) {
            setDistributionData(distResponse.data);
          }
        } catch (error) {
          console.error('Failed to load analytics:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadData();
    }
  }, [status, router]);

  const initials = session?.user?.email?.substring(0, 2).toUpperCase() || 'U';

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'brain': return <Brain className="w-5 h-5" />;
      case 'target': return <Target className="w-5 h-5" />;
      case 'clock': return <Clock className="w-5 h-5" />;
      case 'flame': return <Flame className="w-5 h-5" />;
      case 'sparkles': return <Sparkles className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getRecColors = (type: string) => {
    switch (type) {
      case 'alert': return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'warning': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'success': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'info': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'primary': return 'bg-primary-50 text-primary-800 border-primary-200';
      default: return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans animate-fade-in">
      {/* Header Cover */}
      <div className="h-48 md:h-64 bg-gradient-to-br from-primary-600 via-primary-800 to-slate-900 relative">
        <div className="absolute top-6 left-6 flex items-center space-x-4">
          <button
            onClick={() => router.push('/app')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white font-black text-xl tracking-tight hidden sm:block">Analytics Dashboard</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 mb-8 animate-slide-in-from-bottom-4">
          {/* User Info header inside card */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-tr from-primary-500 to-fuchsia-500 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-lg shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                {session?.user?.name || 'Vocab Learner'}
              </h2>
              <p className="text-slate-500 font-medium">{session?.user?.email}</p>
            </div>
          </div>

          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Learning Progress</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
              <div className="p-2.5 bg-primary-100 text-primary-600 rounded-xl mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-slate-800">{stats?.totalCards || 0}</span>
              <span className="text-xs font-bold text-slate-500 mt-1">Total Words</span>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
              <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl mb-3">
                <Star className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-slate-800">{stats?.masteryPercentage || 0}%</span>
              <span className="text-xs font-bold text-slate-500 mt-1">Mastery Rate</span>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
              <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl mb-3">
                <Flame className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-slate-800">{stats?.learningCards || 0}</span>
              <span className="text-xs font-bold text-slate-500 mt-1">Learning Now</span>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
              <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl mb-3">
                <User className="w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-slate-800">{stats?.toLearnCards || 0}</span>
              <span className="text-xs font-bold text-slate-500 mt-1">In Backlog</span>
            </div>
          </div>
          
          {/* Progress Ring / Mastered Indicator */}
          <div className="bg-gradient-to-br from-primary-50 to-purple-50 p-6 rounded-2xl border border-primary-100 flex flex-col md:flex-row items-center justify-between mb-8">
            <div className="mb-4 md:mb-0">
              <h4 className="text-lg font-black text-primary-900 mb-1">Mastery Journey</h4>
              <p className="text-sm font-medium text-primary-600/80">You've mastered {stats?.masteredCards || 0} out of {stats?.totalCards || 0} words.</p>
            </div>
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-primary-200" />
                <circle 
                  cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" 
                  className="text-primary-600 transition-all duration-1000 ease-out" 
                  strokeDasharray={`${(stats?.masteryPercentage || 0) * 2.51} 251`} 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black text-primary-900">{stats?.masteryPercentage || 0}%</span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Activity Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                <Activity className="w-4 h-4 mr-2" /> 7-Day Activity
              </h3>
              <div className="h-64">
                {activityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={(v) => v.split('-').slice(1).join('/')} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}
                      />
                      <Line type="monotone" dataKey="reviews" stroke="#6366f1" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} name="Reviews" />
                      <Line type="monotone" dataKey="masteries" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} name="Mastered" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">No activity data yet</div>
                )}
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                <BookOpen className="w-4 h-4 mr-2" /> Parts of Speech
              </h3>
              <div className="h-64">
                {distributionData.partOfSpeech.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData.partOfSpeech}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {distributionData.partOfSpeech.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'][index % 5]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">No vocabulary data yet</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 mt-12 px-2 flex items-center">
          <Brain className="w-4 h-4 mr-2" /> AI Learning Insights
        </h3>
        
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, idx) => (
              <div 
                key={rec.id} 
                className={`p-5 rounded-2xl border flex flex-col h-full hover:scale-[1.02] transition-transform cursor-pointer animate-slide-in-from-bottom-4 shadow-sm ${getRecColors(rec.type)}`}
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-xl bg-white/50 backdrop-blur-sm shadow-sm`}>
                    {getIcon(rec.icon)}
                  </div>
                </div>
                <h4 className="text-lg font-black mb-2">{rec.title}</h4>
                <p className="text-sm font-medium opacity-90 leading-relaxed mb-4 flex-1">
                  {rec.message}
                </p>
                <button className={`mt-auto py-2 px-4 rounded-xl font-bold text-xs uppercase tracking-widest bg-white/50 hover:bg-white/80 transition-colors self-start`}>
                  {rec.actionLabel}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center shadow-sm">
            <Sparkles className="w-10 h-10 text-primary-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Add some cards to generate AI insights!</p>
          </div>
        )}
      </div>
    </div>
  );
}

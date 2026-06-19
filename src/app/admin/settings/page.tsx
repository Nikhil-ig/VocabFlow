'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, Key, Database, ShieldAlert, CheckCircle, Smartphone, GraduationCap, TrendingUp, Search, Type, LayoutTemplate, MonitorSmartphone } from 'lucide-react';
import { useVocabStore } from '@/lib/store';
import { apiClient } from '@/services/api';

export default function AdminSettingsPage() {
  const { systemSettings, setSystemSettings } = useVocabStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    applicationName: 'VocabFlow AI',
    primaryColor: 'indigo',
    enablePublicReg: true,
    spacedRepAlgorithm: 'SM-2',
    uiStyle: 'glassmorphism',
    cardStyle: 'modern',
    fontFamily: 'inter',
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await (apiClient as any).client.get('/admin/settings');
        const json = res.data;
        if (json.success && json.data) {
          setFormData({
            applicationName: json.data.applicationName,
            primaryColor: json.data.primaryColor,
            enablePublicReg: json.data.enablePublicReg,
            spacedRepAlgorithm: json.data.spacedRepAlgorithm,
            uiStyle: json.data.uiStyle || 'glassmorphism',
            cardStyle: json.data.cardStyle || 'modern',
            fontFamily: json.data.fontFamily || 'inter',
          });
          setSystemSettings(json.data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [setSystemSettings]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await (apiClient as any).client.put('/admin/settings', formData);
      const json = res.data;
      if (json.success) {
        setSystemSettings(json.data);
        setSuccessMsg('Settings saved successfully!');
        
        // Dynamically update the root classes
        document.body.className = document.body.className
          .replace(/theme-\w+/g, '')
          .replace(/ui-\w+/g, '')
          .replace(/font-\w+/g, '');
          
        document.body.classList.add(`theme-${json.data.primaryColor}`);
        document.body.classList.add(`ui-${json.data.uiStyle}`);
        document.body.classList.add(`font-${json.data.fontFamily}`);
        
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setError(json.error || 'Failed to save settings');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold">Loading Settings...</div>;
  }

  const themes = ['indigo', 'emerald', 'rose', 'amber', 'sky', 'fuchsia', 'slate'];

  return (
    <div className={`max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both font-${formData.fontFamily}`}>
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Settings</h1>
        <p className="text-slate-500 font-medium mt-1">Configure global application preferences, UI themes, and aesthetics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Nav */}
        <div className="col-span-1 space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 bg-primary-50 text-primary-700 font-bold rounded-xl border border-primary-100 transition-all">
            <Settings className="w-5 h-5" />
            <span>General Config</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-all">
            <MonitorSmartphone className="w-5 h-5" />
            <span>UI & Aesthetics</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-all">
            <Key className="w-5 h-5" />
            <span>API Keys</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-all">
            <Database className="w-5 h-5" />
            <span>Database Backup</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 font-bold rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all">
            <ShieldAlert className="w-5 h-5" />
            <span>Danger Zone</span>
          </button>
        </div>

        {/* Settings Content */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
               <Settings className="w-5 h-5 text-primary-500"/> Core Settings
            </h2>
            
            {error && <div className="mb-4 p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl font-medium">{error}</div>}
            {successMsg && <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl font-medium flex items-center gap-2"><CheckCircle className="w-5 h-5"/>{successMsg}</div>}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Application Name</label>
                <input
                  type="text"
                  value={formData.applicationName}
                  onChange={(e) => setFormData({...formData, applicationName: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all font-medium text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Primary Theme Color</label>
                <div className="flex flex-wrap gap-3">
                  {themes.map(t => (
                    <button
                      key={t}
                      onClick={() => setFormData({...formData, primaryColor: t})}
                      className={`w-10 h-10 rounded-full border-4 transition-all bg-${t}-500 ${formData.primaryColor === t ? 'border-white ring-2 ring-slate-400 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                      title={t}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-800">Enable Public Registration</h4>
                  <p className="text-sm text-slate-500">Allow new users to create accounts freely.</p>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input 
                    type="checkbox" 
                    name="toggle" 
                    id="toggle" 
                    checked={formData.enablePublicReg}
                    onChange={(e) => setFormData({...formData, enablePublicReg: e.target.checked})}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-primary-500 transform transition-transform duration-200 checked:translate-x-6" 
                    style={{ right: formData.enablePublicReg ? 0 : 'auto', left: formData.enablePublicReg ? 'auto' : 0 }}
                  />
                  <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-primary-500 cursor-pointer"></label>
                </div>
              </div>
            </div>
            
            <div className="mt-10 mb-6 border-t border-slate-100 pt-8">
               <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <LayoutTemplate className="w-5 h-5 text-primary-500"/> UI & Aesthetics
               </h2>
               
               <div className="space-y-6">
                 {/* UI Style */}
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700">App Component Style</label>
                   <div className="grid grid-cols-3 gap-3">
                     {['minimal', 'glassmorphism', 'playful'].map(style => (
                       <button
                         key={style}
                         onClick={() => setFormData({...formData, uiStyle: style})}
                         className={`p-3 border-2 rounded-xl text-center capitalize transition-all font-bold text-sm ${formData.uiStyle === style ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                       >
                         {style}
                       </button>
                     ))}
                   </div>
                 </div>

                 {/* Card Style */}
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700">Flashcard Style</label>
                   <div className="grid grid-cols-3 gap-3">
                     {['classic', 'modern', '3d'].map(style => (
                       <button
                         key={style}
                         onClick={() => setFormData({...formData, cardStyle: style})}
                         className={`p-3 border-2 rounded-xl text-center capitalize transition-all font-bold text-sm ${formData.cardStyle === style ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                       >
                         {style === '3d' ? '3D / Game' : style}
                       </button>
                     ))}
                   </div>
                 </div>

                 {/* Typography */}
                 <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><Type className="w-4 h-4"/> Global Typography</label>
                   <select 
                     value={formData.fontFamily}
                     onChange={(e) => setFormData({...formData, fontFamily: e.target.value})}
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all font-medium text-slate-800 bg-white capitalize"
                   >
                     <option value="inter">Inter (Clean & Professional)</option>
                     <option value="outfit">Outfit (Modern & Geometric)</option>
                     <option value="roboto">Roboto (Standard UI)</option>
                     <option value="comic">Comic Neue (Playful & Fun)</option>
                   </select>
                 </div>
               </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-slate-200 transition-all font-bold"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Live Mobile Preview */}
        <div className="col-span-1 lg:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> Live Mobile Preview
            </h3>
            
            {/* Mobile Device Frame */}
            <div className={`theme-${formData.primaryColor} font-${formData.fontFamily} w-[300px] h-[600px] bg-slate-50 rounded-[2.5rem] shadow-2xl overflow-hidden relative mx-auto transition-all ${
              formData.uiStyle === 'playful' ? 'border-[10px] border-primary-900 border-b-[16px]' :
              formData.uiStyle === 'minimal' ? 'border-[4px] border-slate-300' :
              'border-[8px] border-slate-900'
            }`}>
              {/* iPhone Notch */}
              <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 rounded-b-3xl w-40 mx-auto z-20"></div>
              
              {/* Mock App Content */}
              <div className="h-full flex flex-col bg-slate-50 relative z-10 pt-8">
                {/* Mock Header */}
                <div className={`px-4 py-4 text-white flex items-center gap-3 transition-colors ${
                  formData.uiStyle === 'minimal' ? 'bg-white text-slate-800 border-b border-slate-200' :
                  formData.uiStyle === 'playful' ? 'bg-primary-500 shadow-md' :
                  'bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900'
                }`}>
                  <div className={`p-1.5 rounded-lg border ${
                    formData.uiStyle === 'minimal' ? 'bg-slate-100 border-slate-200' :
                    'bg-primary-600/30 border-primary-500/20'
                  }`}>
                    <GraduationCap className={`w-5 h-5 ${formData.uiStyle === 'minimal' ? 'text-primary-600' : 'text-primary-400'}`} />
                  </div>
                  <span className="font-bold text-sm truncate">{formData.applicationName}</span>
                </div>
                
                {/* Mock Search */}
                <div className="px-4 py-3">
                  <div className={`flex items-center px-3 py-2 ${
                    formData.uiStyle === 'minimal' ? 'bg-white border-b-2 border-slate-200' :
                    formData.uiStyle === 'playful' ? 'bg-white rounded-2xl border-4 border-slate-200 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]' :
                    'bg-white rounded-full border border-slate-200 shadow-sm'
                  }`}>
                    <Search className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-xs text-slate-400">Search words...</span>
                  </div>
                </div>

                {/* Mock Cards */}
                <div className="px-4 flex-1 space-y-3">
                  {[
                    { term: 'Ephemeral', def: 'Lasting for a very short time.' },
                    { term: 'Ubiquitous', def: 'Present, appearing, or found everywhere.' }
                  ].map((card, i) => (
                    <div key={i} className={`bg-white p-4 transition-all ${
                      formData.cardStyle === '3d' ? 'rounded-2xl border-4 border-slate-900 border-b-[8px] hover:translate-y-1 hover:border-b-4' :
                      formData.cardStyle === 'classic' ? 'border border-slate-300' :
                      'rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-primary-500'
                    }`}>
                      <h4 className="font-bold text-slate-800 text-sm">{card.term}</h4>
                      <p className="text-xs text-slate-500 mt-1">{card.def}</p>
                    </div>
                  ))}
                  
                  {/* Mock Primary Button */}
                  <div className="mt-6 flex justify-center">
                    <button className={`px-6 py-2 text-white text-sm font-bold transition-all ${
                      formData.uiStyle === '3d' || formData.cardStyle === '3d' ? 'rounded-xl bg-primary-500 border-4 border-primary-700 border-b-[6px] active:translate-y-1 active:border-b-4' :
                      formData.uiStyle === 'minimal' ? 'rounded-md bg-slate-900 text-white' :
                      'rounded-full bg-primary-500 shadow-lg shadow-primary-200'
                    }`}>
                      Start Quiz
                    </button>
                  </div>
                </div>

                {/* Mock Bottom Nav */}
                <div className="h-14 bg-white border-t border-slate-200 flex justify-around items-center text-slate-400 px-4">
                  <div className="flex flex-col items-center text-primary-600">
                    <GraduationCap className="w-5 h-5" />
                    <span className="text-[9px] font-bold mt-1">Learn</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-[9px] font-bold mt-1">Stats</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Settings className="w-5 h-5" />
                    <span className="text-[9px] font-bold mt-1">Admin</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

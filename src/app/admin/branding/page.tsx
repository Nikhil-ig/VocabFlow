'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { axiosInstance } from '@/services/api';
import { Save, Image as ImageIcon, Palette, Globe } from 'lucide-react';

export default function BrandingSettingsPage() {
  const { user, organization } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    primaryColor: '#6366f1', // default indigo-500
    customDomain: '',
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        logoUrl: organization.logoUrl || '',
        primaryColor: organization.primaryColor || '#6366f1',
        customDomain: (organization as any).customDomain || '',
      });
    }
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;

    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      const res = await axiosInstance.put(`/organizations/${organization.id}`, formData);
      if (res.data.success) {
        setSuccess(true);
        // We could refresh context here, but reloading ensures CSS variables reload cleanly
        window.location.reload(); 
      } else {
        setError(res.data.error || 'Failed to update branding');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update branding');
    } finally {
      setLoading(false);
    }
  };

  if (!organization) {
    return <div className="p-8 text-center text-slate-500">Loading organization details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">White-Label Branding</h1>
        <p className="text-slate-500 mt-2">Customize the look and feel of VocabFlow for your users.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 text-sm">
              Branding updated successfully! The page will reload to apply changes.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                <Palette className="w-5 h-5 mr-2 text-primary-500" />
                Brand Colors
              </h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">Primary Brand Color (Hex)</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="h-12 w-12 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="flex-1 max-w-xs px-4 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="#6366f1"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">This color will be used for buttons, links, and accents across your tenant.</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-primary-500" />
                Custom Logo
              </h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">Logo URL (HTTPS)</label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="https://yourcompany.com/logo.png"
                />
                
                {formData.logoUrl && (
                  <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl inline-block">
                    <p className="text-xs text-slate-500 font-medium mb-2 uppercase">Preview</p>
                    <img src={formData.logoUrl} alt="Logo Preview" className="h-12 object-contain" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-primary-500" />
                Custom Domain (Coming Soon)
              </h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 opacity-60 pointer-events-none">
                <label className="block text-sm font-medium text-slate-700 mb-2">Domain Name</label>
                <input
                  type="text"
                  disabled
                  value={formData.customDomain}
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-slate-500"
                  placeholder="learn.yourcompany.com"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 shadow-md shadow-primary-600/20"
              >
                {loading ? 'Saving...' : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Brand Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

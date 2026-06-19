'use client';

import { useState, useEffect } from 'react';
import { BoardColumn } from '@/types';
import { Plus, Edit2, Trash2, GripVertical, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/services/api';
import { useVocabStore } from '@/lib/store';

const PREDEFINED_THEMES = [
  { name: 'Indigo', colorClass: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700' },
  { name: 'Amber', colorClass: 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700' },
  { name: 'Emerald', colorClass: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700' },
  { name: 'Rose', colorClass: 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700' },
  { name: 'Sky', colorClass: 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-700' },
  { name: 'Fuchsia', colorClass: 'bg-fuchsia-50 hover:bg-fuchsia-100 border-fuchsia-200 text-fuchsia-700' },
];

export default function ColumnManagerPage() {
  const [columns, setColumns] = useState<BoardColumn[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null);
  
  const [formData, setFormData] = useState({ name: '', color: PREDEFINED_THEMES[0].colorClass });
  const [error, setError] = useState<string | null>(null);

  const setBoardColumns = useVocabStore(state => state.setBoardColumns);

  useEffect(() => {
    loadColumns();
  }, []);

  const loadColumns = async () => {
    try {
      const response = await apiClient.getColumns();
      if (response.success && response.data) {
        setColumns(response.data);
        setBoardColumns(response.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingColumn(null);
    setFormData({ name: '', color: PREDEFINED_THEMES[0].colorClass });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (col: BoardColumn) => {
    setEditingColumn(col);
    setFormData({ name: col.name, color: col.color });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        setError("Name is required");
        return;
      }
      
      if (editingColumn) {
        await apiClient.updateColumn(editingColumn.id, { name: formData.name, color: formData.color });
      } else {
        await apiClient.createColumn({ 
          name: formData.name, 
          color: formData.color, 
          order: columns.length
        });
      }
      
      setIsModalOpen(false);
      await loadColumns();
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this column? It will fail if it currently holds cards.")) {
      try {
        await apiClient.deleteColumn(id);
        await loadColumns();
      } catch (err: any) {
        alert(err.response?.data?.error || "Failed to delete column");
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold">Loading columns...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Column Manager</h1>
          <p className="text-slate-500 font-medium mt-1">Configure the vocabulary learning workflow.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 transition-all font-bold"
        >
          <Plus className="w-5 h-5" />
          <span>Add Column</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {columns.map((col, idx) => (
            <div key={col.id} className="p-4 sm:p-6 flex items-center justify-between group hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-4">
                <GripVertical className="w-5 h-5 text-slate-300 cursor-grab active:cursor-grabbing hover:text-indigo-400" />
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 text-lg">{col.name}</span>
                  <span className="text-xs text-slate-500 font-medium">Order: {col.order}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Theme preview pill */}
                <div className={`hidden sm:flex px-3 py-1 border rounded-lg text-xs font-bold ${col.color}`}>
                  Preview
                </div>
                
                <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
                  <button 
                    onClick={() => openEditModal(col)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(col.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {columns.length === 0 && (
            <div className="p-12 text-center text-slate-400 font-medium">
              No columns found.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-800 text-xl">
                {editingColumn ? 'Edit Column' : 'Create New Column'}
              </h3>
            </div>
            <div className="p-6 space-y-6">
              {error && (
                <div className="flex items-center space-x-2 text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 text-sm font-bold">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Column Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Mastered Level 2"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all font-medium text-slate-800"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">Color Theme</label>
                <div className="grid grid-cols-2 gap-3">
                  {PREDEFINED_THEMES.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => setFormData({ ...formData, color: theme.colorClass })}
                      className={`px-3 py-3 rounded-xl border-2 text-sm font-bold transition-all ${theme.colorClass} ${
                        formData.color === theme.colorClass 
                          ? 'ring-2 ring-indigo-500 ring-offset-2 scale-105 shadow-md' 
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all"
              >
                Save Column
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

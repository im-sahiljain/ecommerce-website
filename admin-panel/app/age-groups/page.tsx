'use client';

import React, { useState, useEffect } from 'react';
import { Users, Trash2 } from 'lucide-react';
import { adminFetch } from '../../config/auth';

interface AgeGroup {
  id: string;
  name: string;
  slug: string;
}

export default function AgeGroupsPage() {
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [name, setName] = useState('');

  const fetchAgeGroups = () => {
    adminFetch('/api/age-groups')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAgeGroups(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchAgeGroups();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await adminFetch('/api/age-groups', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
    setName('');
    fetchAgeGroups();
  };

  const handleDelete = async (id: string) => {
    await adminFetch(`/api/age-groups/${id}`, { method: 'DELETE' });
    fetchAgeGroups();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-800">Age Groups Management</h1>
        <p className="text-slate-500 text-xs mt-1">Target product difficulty by age rating (e.g. Ages 2-4, Ages 4+, Ages 8+).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 h-fit">
          <h3 className="font-bold text-sm text-slate-800">Add Age Rating</h3>
          <form onSubmit={handleAdd} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Age Label</label>
              <input
                type="text"
                placeholder="e.g. Ages 12+"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl text-xs shadow transition"
            >
              + Create Age Group
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
              <tr>
                <th className="p-4">Age Label</th>
                <th className="p-4">Slug</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ageGroups.map(a => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800">{a.name}</td>
                  <td className="p-4 text-slate-500">{a.slug}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

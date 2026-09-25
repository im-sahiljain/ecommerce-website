"use client";

import React, { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { adminFetch } from "@/config/adminAuth";

interface AgeGroup {
  id: string;
  name: string;
  slug: string;
}

export default function AgeGroupsPage() {
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [name, setName] = useState("");

  const fetchAgeGroups = () => {
    adminFetch("/api/age-groups")
      .then((res) => res.json())
      .then((data) => {
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
    await adminFetch("/api/age-groups", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    setName("");
    fetchAgeGroups();
  };

  const handleDelete = async (id: string) => {
    await adminFetch(`/api/age-groups/${id}`, { method: "DELETE" });
    fetchAgeGroups();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs">
        <h1 className="text-2xl font-extrabold text-neutral-800">
          Age Groups Management
        </h1>
        <p className="text-neutral-500 text-xs mt-1">
          Target product difficulty by age rating (e.g. Ages 2-4, Ages 4+, Ages
          8+).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4 h-fit">
          <h3 className="font-bold text-sm text-neutral-800">Add Age Rating</h3>
          <form onSubmit={handleAdd} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-neutral-600 mb-1">
                Age Label
              </label>
              <input
                type="text"
                placeholder="e.g. Ages 12+"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 border rounded-xl"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl text-xs shadow-sm transition"
            >
              + Create Age Group
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase border-b">
              <tr>
                <th className="p-4">Age Label</th>
                <th className="p-4">Slug</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {ageGroups.map((a) => (
                <tr key={a.id} className="hover:bg-neutral-50">
                  <td className="p-4 font-bold text-neutral-800">{a.name}</td>
                  <td className="p-4 text-neutral-500">{a.slug}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 bg-neutral-100 hover:bg-red-100 text-neutral-600 hover:text-red-600 rounded-lg"
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

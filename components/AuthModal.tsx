'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ACCOUNT_AUTH_PAUSED } from '../lib/accountAuth';
import { X, User, Lock, PhoneCall, Sparkles } from 'lucide-react';

export default function AuthModal() {
  const { isAuthOpen, closeAuth, login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (ACCOUNT_AUTH_PAUSED || !isAuthOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your email or phone number.');
      return;
    }
    setError('');
    const success = await login(identifier, password, name);
    if (!success) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative border border-primary/15 animate-in fade-in zoom-in duration-200">
        <button
          onClick={closeAuth}
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary/15 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-800">Welcome Little Creator!</h3>
          <p className="text-neutral-500 text-sm mt-1">Sign in with your Email or Phone number to view orders</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Email or Phone Number</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. artist@gmail.com or 555-0199"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40 transition"
              />
              <PhoneCall className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Your Name (Optional)</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Artist / Kid's Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40 transition"
              />
              <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Any password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40 transition"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-primary/40 hover:bg-primary/70 text-neutral-800 font-bold rounded-full shadow-xs hover:shadow-sm transition transform active:scale-98 text-sm mt-2"
          >
            Start Creating & Order
          </button>
        </form>
      </div>
    </div>
  );
}

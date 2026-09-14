import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Shield, Trash2, Edit2, Check, X } from 'lucide-react';
import api from '../services/api.js';

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('OPERATOR');
  const [msg, setMsg] = useState(null);

  const loadUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data?.data || []);
    } catch (e) {
      console.warn('Error loading users:', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', { name, email, password, role });
      setShowAddModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setMsg('User provisioned successfully');
      loadUsers();
    } catch (e) {
      setMsg(e.response?.data?.message || 'Error creating user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Revoke access and delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      loadUsers();
    } catch (e) {
      alert('Failed to delete user');
    }
  };

  return (
    <div className="space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-black text-slate-900">
            Station User Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provision, assign operational roles, and manage access privileges across POLAR TWIN.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New User</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-purple-50 border border-purple-200 text-purple-800 text-xs rounded-xl flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg(null)} className="font-bold">×</button>
        </div>
      )}

      {/* User Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-200">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Operational Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50/50">
                <td className="p-4 font-semibold text-slate-900">{u.name}</td>
                <td className="p-4 font-mono text-slate-500">{u.email}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                      u.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : u.role === 'OPERATOR'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{u.isActive ? 'Active' : 'Suspended'}</span>
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-heading font-bold text-lg text-slate-900">
              Provision Station Operator
            </h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                  placeholder="Capt. Vikram Sen"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                  placeholder="vikram@polartwin.gov.in"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Password</label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                  placeholder="••••••••••••"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                >
                  <option value="OPERATOR">OPERATOR</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;

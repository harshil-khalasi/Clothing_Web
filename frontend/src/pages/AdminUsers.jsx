import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trash2, 
  Search, 
  Mail, 
  Shield, 
  User as UserIcon, 
  MoreVertical, 
  Calendar,
  AlertCircle,
  Loader2,
  X,
  ChevronRight
} from 'lucide-react';
import { getAllUsers, deleteUser } from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setIsDeleting(id);
      try {
        await deleteUser(id);
        setUsers(users.filter(u => u._id !== id));
      } catch (err) {
        alert(err.message || 'Error deleting user');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="text-blue-600" size={32} />
            Customer Directory
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Manage your unified user access system</p>
        </div>
        <div className="bg-blue-50 text-blue-600 px-6 py-4 rounded-2xl font-bold flex items-center gap-2 border border-blue-100">
           <Shield size={20} /> Access Security Enabled
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm group-hover:shadow-md text-sm font-medium"
          />
        </div>
        
        <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
          <span>Active Users: {users.length}</span>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <span>Total Roles: 2</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <th className="px-10 py-6">User Identity</th>
                <th className="px-10 py-6">Access Level</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6">Registration Date</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-10 py-8"><div className="h-12 bg-gray-50 rounded-2xl"></div></td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${
                          u.role === 'admin' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block text-base line-clamp-1">{u.name}</span>
                          <span className="text-gray-400 text-xs font-medium flex items-center gap-1">
                            <Mail size={12} /> {u.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-widest ${
                        u.role === 'admin' 
                        ? 'bg-pink-50 text-pink-600 border-pink-100' 
                        : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        <Shield size={12} className="opacity-50" />
                        {u.role}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-black text-gray-700 uppercase tracking-widest">Online</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                        <Calendar size={14} className="text-gray-300" />
                        {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      {u.role !== 'admin' && (
                        <button 
                          onClick={() => handleDelete(u._id)}
                          disabled={isDeleting === u._id}
                          className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-90 disabled:opacity-50"
                        >
                          {isDeleting === u._id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-10 py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-6">
                      <UserIcon size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No Customers Found</h3>
                    <p className="text-gray-400 mt-2">Start growing your community by inviting users.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Banner */}
      <div className="bg-gray-900 rounded-[40px] p-8 text-white relative overflow-hidden flex flex-col md:row items-center justify-between gap-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500">
            <Shield size={32} />
          </div>
          <div>
            <h4 className="text-xl font-black tracking-tight">Security Oversight</h4>
            <p className="text-gray-400 text-sm font-medium">The unified login system ensures administrative control over all customer profiles.</p>
          </div>
        </div>
        <div className="relative z-10">
          <button className="bg-white text-gray-900 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95">
            Audit Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;

import React, { useState, useEffect } from 'react';
import { getAllSubcategories, createSubcategory, updateSubcategory, deleteSubcategory } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Tag, Loader2 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const AdminSubcategories = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const fetchSubcategories = async () => {
    try {
      const data = await getAllSubcategories();
      setSubcategories(data);
    } catch (err) {
      toast.error('Failed to load subcategories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');

    setIsSubmitting(true);
    try {
      if (editId) {
        await updateSubcategory(editId, { name });
        toast.success('Subcategory updated');
      } else {
        await createSubcategory({ name });
        toast.success('Subcategory created');
      }
      setName('');
      setEditId(null);
      fetchSubcategories();
    } catch (err) {
      toast.error(err.message || 'Failed to save subcategory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (sub) => {
    setEditId(sub._id);
    setName(sub.name);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await deleteSubcategory(id);
        toast.success('Subcategory deleted');
        fetchSubcategories();
      } catch (err) {
        toast.error('Failed to delete subcategory');
      }
    }
  };

  // 🔌 Real-time Socket Listeners
  const socket = useSocket();
  useEffect(() => {
    if (!socket) return;

    socket.on('subcategory:created', (newSub) => {
      setSubcategories(prev => [...prev.filter(s => s._id !== newSub._id), newSub]);
    });

    socket.on('subcategory:updated', (updatedSub) => {
      setSubcategories(prev => prev.map(s => s._id === updatedSub._id ? updatedSub : s));
    });

    socket.on('subcategory:deleted', (deletedId) => {
      setSubcategories(prev => prev.filter(s => s._id !== deletedId));
    });

    return () => {
      socket.off('subcategory:created');
      socket.off('subcategory:updated');
      socket.off('subcategory:deleted');
    };
  }, [socket]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Manage Subcategories</h1>
        <p className="text-gray-500 font-medium italic mt-2">Create and organize product subcategories</p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 max-w-xl">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="flex-1 relative">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shirts, Hoodies..."
              className="w-full bg-gray-50 border border-transparent rounded-2xl py-3 pl-12 pr-4 focus:bg-white focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all font-bold text-gray-900"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-pink-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-pink-700 transition"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : editId ? <Edit2 size={18} /> : <Plus size={18} />}
            {editId ? 'Update' : 'Add'}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => { setEditId(null); setName(''); }}
              className="bg-gray-100 text-gray-600 px-6 py-3 rounded-2xl font-bold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-pink-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subcategories.map(sub => (
            <div key={sub._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-lg transition">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{sub.name}</h3>
                <p className="text-xs text-gray-400 font-medium">Created: {new Date(sub.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => handleEdit(sub)}
                  className="w-10 h-10 bg-amber-50 text-amber-600 flex items-center justify-center rounded-xl hover:bg-amber-100 transition"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(sub._id)}
                  className="w-10 h-10 bg-red-50 text-red-600 flex items-center justify-center rounded-xl hover:bg-red-100 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSubcategories;

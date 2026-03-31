import React, { useState } from 'react';
import { Eye, Download, Search, Filter } from 'lucide-react';
import Card from '../components/Card';

const Orders = () => {
  const initialOrders = [
    { id: '#ORD-001', date: 'Mar 24, 2026', customer: 'John Doe', items: 2, total: '$125.00', status: 'Delivered' },
    { id: '#ORD-002', date: 'Mar 25, 2026', customer: 'Jane Smith', items: 1, total: '$89.00', status: 'Processing' },
    { id: '#ORD-003', date: 'Mar 25, 2026', customer: 'Mike Ross', items: 3, total: '$210.00', status: 'Shipped' },
    { id: '#ORD-004', date: 'Mar 26, 2026', customer: 'Rachel Zane', items: 1, total: '$65.00', status: 'Pending' },
    { id: '#ORD-005', date: 'Mar 26, 2026', customer: 'Harvey Specter', items: 4, total: '$450.00', status: 'Delivered' },
    { id: '#ORD-006', date: 'Mar 27, 2026', customer: 'Donna Paulsen', items: 2, total: '$180.00', status: 'Processing' },
  ];

  const [orders, setOrders] = useState(initialOrders);

  const handleStatusChange = (id, newStatus) => {
    setOrders(orders.map(order => 
      order.id === id ? { ...order, status: newStatus } : order
    ));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Order Management</h2>
          <p className="text-gray-500">Track and manage customer orders and fulfillment.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download size={18} /> Export List
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by order ID or customer name..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-pink-500 transition-all"
          />
        </div>
        <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-2 font-bold text-gray-600 hover:bg-gray-50 transition-colors">
          <Filter size={20} /> Filter Status
        </button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {orders.map((order, index) => (
                <tr key={index} className="border-b border-gray-50 last:border-none hover:bg-pink-50/30 transition-colors">
                  <td className="px-6 py-5 font-bold text-gray-800">{order.id}</td>
                  <td className="px-6 py-5 text-gray-600">{order.date}</td>
                  <td className="px-6 py-5 font-medium text-gray-700">{order.customer}</td>
                  <td className="px-6 py-5 text-gray-600">{order.items} items</td>
                  <td className="px-6 py-5 font-bold text-pink-600">{order.total}</td>
                  <td className="px-6 py-5">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border-none focus:ring-2 focus:ring-pink-500 cursor-pointer ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                        order.status === 'Processing' ? 'bg-amber-100 text-amber-600' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-600' :
                        'bg-red-100 text-red-600'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Orders;

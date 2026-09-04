import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaWhatsapp, FaInstagram } from 'react-icons/fa';
import logo from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-800/80 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="My Wearables Logo" className="w-10 h-10 object-contain rounded-xl" />
              <span className="text-xl font-black text-white tracking-tight">
                My <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Wearables</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 font-normal">
              Discover the finest luxury apparel for men, women, and kids. High-quality fashion delivered with speed, elegance, and perfection.
            </p>
            <div className="flex gap-4 mt-2">
              <a 
                href="https://www.instagram.com/mywearables_?igsh=MWwxYnd5bXMxMnhseQ==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-slate-900 border border-slate-800 hover:border-pink-500/50 hover:bg-gradient-to-tr hover:from-purple-600 hover:to-pink-500 hover:text-white text-slate-400 transition-all duration-300 shadow-md hover:scale-110"
              >
                <FaInstagram size={18} />
              </a>

              <a 
                href="https://chat.whatsapp.com/HZewwR0ii20JDUukH5H0LP" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2.5 rounded-full bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-600 hover:text-white text-slate-400 transition-all duration-300 shadow-md hover:scale-110"
              >
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-extrabold mb-6 text-sm uppercase tracking-wider">Shop Collections</h4>
            <ul className="space-y-3 text-xs font-medium">
              <li><a href="/products?featured=true" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">Featured Products</a></li>
              <li><a href="/products" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">All Products</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-extrabold mb-6 text-sm uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-3 text-xs font-medium">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Return & Refund</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-extrabold mb-6 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-4 text-xs font-medium">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                <span className="text-slate-400">F-7 , Gajanan Complex, Beside Post office , Station road, Sachin, Surat 394230, Surat, Gujarat 394240</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-indigo-400 shrink-0" />
                <span className="text-slate-400">+91 8200141826</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-indigo-400 shrink-0" />
                <span className="text-slate-400">support@MyWearables.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
          <p>© 2026 My Wearables Fashion. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


import React from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { FaWhatsapp,FaInstagram  } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">K</div>
              <span className="text-xl font-bold text-white tracking-tight">My Wearables</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Discover the latest trends in clothing for men, women, and kids. High-quality fashion delivered with excellence.
            </p>
            <div className="flex gap-4 mt-2">
  <a 
  href="https://www.instagram.com/mywearables_?igsh=MWwxYnd5bXMxMnhseQ==" 
  target="_blank" 
  rel="noopener noreferrer"
>
  <FaInstagram size={20} className="text-pink-500 hover:scale-110 transition-all duration-300 cursor-pointer" />
</a>

              <a 
  href="https://chat.whatsapp.com/HZewwR0ii20JDUukH5H0LP" 
  target="_blank" 
  rel="noopener noreferrer"
>
  <FaWhatsapp size={20} className="text-green-500 hover:scale-110 transition-all duration-300 cursor-pointer" />
</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="/products?category=Men" className="hover:text-pink-500 transition-colors">Men's Fashion</a></li>
              <li><a href="/products?category=Women" className="hover:text-pink-500 transition-colors">Women's Fashion</a></li>
              <li><a href="/products?category=Kids" className="hover:text-pink-500 transition-colors">Kids' Collection</a></li>
              <li><a href="/products" className="hover:text-pink-500 transition-colors">All Products</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Customer Care</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-pink-500 transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Return & Refund</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-pink-600 mt-0.5 shrink-0" />
                <span>123 Fashion Street, Garment District, Mumbai, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-pink-600 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-pink-600 shrink-0" />
                <span>support@MyWearables.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:row justify-between items-center gap-4 text-xs">
          <p className="text-gray-500">© 2026 My Wearables Fashion. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-pink-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-pink-500 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

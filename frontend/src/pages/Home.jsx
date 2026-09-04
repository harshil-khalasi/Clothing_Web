import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Zap, ShieldCheck, Truck,
  Mail, Sparkles, Star
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { getAllProducts, getAllSubcategories } from '../services/api';
import ProductCard from '../components/ProductCard';

/* ─────────────────────────────────────────────────────────────────────────────
   HOME PAGE  ·  High-Impact Vibrant Aesthetics & UI Animations
───────────────────────────────────────────────────────────────────────────── */

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  /* ── Parallax helpers ── */
  const { scrollYProgress } = useScroll();
  const y1     = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const y2     = useTransform(scrollYProgress, [0, 1], [0, -350]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

  /* ── Hero slides ── */
  const heroSlides = [
    {
      title:    'Style That Defines You',
      subtitle: '✨ New Collection 2026',
      desc:     'Explore our curated selection of luxury apparel designed for elegance, supreme comfort, and modern urban sophistication.',
      image:    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2000',
      accent:   'from-indigo-400 via-purple-300 to-pink-400',
      tag:      'TRENDING NOW'
    },
    {
      title:    'Urban Ethereal Wear',
      subtitle: "🔥 Winter Drop '26",
      desc:     'Minimalist aesthetics meeting premium warmth. Redefine your daily drip with our signature streetwear and formal collections.',
      image:    'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=2000',
      accent:   'from-cyan-400 via-teal-300 to-indigo-400',
      tag:      'LIMITED EDITION'
    },
    {
      title:    'Pure Eco Organic',
      subtitle: '🌿 Sustainable Luxury',
      desc:     '100% organic combed cotton, zero-waste eco manufacturing. Conscious fashion that elevates your aesthetic while caring for Earth.',
      image:    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=2000',
      accent:   'from-emerald-400 via-teal-300 to-cyan-400',
      tag:      'ECO FRIENDLY'
    },
  ];

  /* ── Auto-advance slider ── */
  useEffect(() => {
    const t = setInterval(() => setActiveSlide(p => (p + 1) % heroSlides.length), 6000);
    return () => clearInterval(t);
  }, []);

  const [subcategories, setSubcategories] = useState([]);

  /* ── Fetch products and subcategories from backend ── */
  useEffect(() => {
    (async () => {
      try {
        const [prodData, subData] = await Promise.all([
          getAllProducts(),
          getAllSubcategories()
        ]);
        setFeaturedProducts(prodData.slice(0, 4));
        setSubcategories(subData);
      } catch (e) {
        console.error('Error fetching data:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Static feature icons ── */
  const features = [
    { icon: <Zap size={24} />,        title: 'Express Delivery',   desc: 'Dispatched within 24 hours nationwide' },
    { icon: <ShieldCheck size={24} />, title: 'Verified Purchase', desc: 'Seamless WhatsApp & UPI checkout' },
    { icon: <Truck size={24} />,       title: 'Complimentary Shipping',  desc: 'Free delivery on orders over ₹999' },
  ];

  /* ── Animation variants ── */
  const container = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };
  const item = {
    hidden:  { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
  };

  /* ═══════════════════════ JSX ═══════════════════════ */
  return (
    <div className="font-sans bg-slate-50/60 overflow-x-hidden relative selection:bg-indigo-600 selection:text-white">

      {/* ── Ambient Glowing Light Blobs (Decorative Mesh) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div style={{ y: y1, rotate }}
          className="absolute -top-32 -left-32 w-[550px] lg:w-[750px] h-[550px] lg:h-[750px]
                     bg-gradient-to-br from-indigo-400/25 via-purple-400/20 to-pink-400/15 rounded-full blur-[140px] animate-pulse-glow" />
        <motion.div style={{ y: y2 }}
          className="absolute top-1/2 -right-32 w-[500px] lg:w-[650px] h-[500px] lg:h-[650px]
                     bg-gradient-to-br from-cyan-400/20 via-indigo-500/15 to-rose-400/20 rounded-full blur-[150px]" />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO — Full-viewport Luxury Slider
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative h-[80vh] sm:h-[88vh] lg:h-[92vh] flex items-center bg-slate-950 overflow-hidden">

        {/* Slide background */}
        <AnimatePresence mode="wait">
          <motion.div key={activeSlide}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0 z-0"
          >
            <motion.img
              src={heroSlides[activeSlide].image} alt="Hero"
              initial={{ scale: 1.12 }} animate={{ scale: 1 }}
              transition={{ duration: 6, ease: 'linear' }}
              className="w-full h-full object-cover opacity-50"
              referrerPolicy="no-referrer"
            />
            {/* Rich multi-tone dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
          </motion.div>
        </AnimatePresence>

        {/* Slide content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeSlide}
              initial="hidden" animate="visible" exit="hidden"
              variants={container}
              className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl"
            >
              {/* Badge */}
              <motion.div variants={item} className="flex items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20
                                 text-white font-extrabold uppercase tracking-widest text-[10px] sm:text-xs shadow-lg">
                  {heroSlides[activeSlide].subtitle}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-black text-[9px] uppercase tracking-wider shadow-md">
                  <Star size={10} fill="currentColor" /> {heroSlides[activeSlide].tag}
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1 variants={item}
                className="text-[2.8rem] leading-[1.05] xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl
                           font-black text-white mb-6 tracking-tighter"
              >
                {heroSlides[activeSlide].title.split(' ').slice(0, -1).join(' ')}{' '}
                <br />
                <span className={`text-transparent bg-clip-text bg-gradient-to-r
                                  ${heroSlides[activeSlide].accent} animate-gradient-x`}>
                  {heroSlides[activeSlide].title.split(' ').slice(-1)}
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p variants={item}
                className="text-slate-300 text-sm sm:text-base md:text-lg lg:text-xl
                           mb-9 max-w-md sm:max-w-lg leading-relaxed font-normal opacity-90"
              >
                {heroSlides[activeSlide].desc}
              </motion.p>

              {/* CTAs */}
              <motion.div variants={item}
                className="flex flex-col min-[380px]:flex-row gap-4"
              >
                <Link to="/products"
                  className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white
                             px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider
                             hover:brightness-110 hover:shadow-[0_10px_35px_-5px_rgba(99,102,241,0.5)] transition-all duration-300
                             flex items-center justify-center gap-2.5
                             group shadow-xl shadow-indigo-600/30 active:scale-95 shimmer-effect"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Shop Now <Sparkles size={16} />
                  </span>
                  <ArrowRight size={17}
                    className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link to="/products?featured=true"
                  className="bg-white/10 backdrop-blur-2xl text-white border border-white/25
                             px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider
                             hover:bg-white/20 hover:border-white/40 transition-all duration-300 text-center active:scale-95 shadow-lg"
                >
                  View Lookbook
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot controls */}
        <div className="absolute bottom-8 right-6 sm:right-12 z-20 flex gap-2.5">
          {heroSlides.map((_, idx) => (
            <button key={idx} onClick={() => setActiveSlide(idx)}
              className={`h-2 rounded-full transition-all duration-500 ${
                activeSlide === idx
                  ? 'w-10 bg-gradient-to-r from-indigo-500 to-pink-500 shadow-md shadow-indigo-500/50'
                  : 'w-3 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Scroll cue */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden lg:flex flex-col items-center gap-2"
        >
          <span className="text-white/50 text-[9px] uppercase tracking-[0.4em] font-extrabold">Scroll Down</span>
          <div className="w-0.5 h-14 bg-gradient-to-b from-indigo-500 via-pink-500 to-transparent rounded-full overflow-hidden">
            <motion.div animate={{ y: [0, 56] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-full h-1/3 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURES — Glassmorphism floating cards
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                      -mt-10 sm:-mt-16 lg:-mt-20">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={container}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6"
        >
          {features.map((f, i) => (
            <motion.div key={i} variants={item}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/90 backdrop-blur-2xl
                         rounded-3xl p-6 lg:p-8
                         shadow-xl shadow-indigo-500/8 border border-slate-200/80
                         flex items-center gap-5
                         hover:shadow-2xl hover:shadow-indigo-500/15 hover:border-indigo-300/50 transition-all duration-500 group"
            >
              <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.6 }}
                className="w-14 h-14
                           bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl
                           flex items-center justify-center shrink-0
                           shadow-md shadow-indigo-500/30 group-hover:shadow-lg group-hover:shadow-indigo-500/50 transition-all duration-500"
              >
                {f.icon}
              </motion.div>
              <div className="min-w-0">
                <h4 className="font-black text-slate-900 text-base tracking-tight">
                  {f.title}
                </h4>
                <p className="text-slate-500 text-xs mt-1 font-medium leading-snug">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          CATEGORIES — Dynamic Grid with Hover Glows (Compact Small Cards)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 sm:py-14 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-6 sm:mb-10">
          <span className="text-indigo-600 font-extrabold uppercase tracking-widest text-[10px] sm:text-xs mb-1 block">
            Handcrafted Collections
          </span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl
                       font-black text-slate-900 tracking-tighter"
          >
            Explore <span className="text-gradient-vibrant">Categories</span>
          </motion.h2>
          <motion.div
            initial={{ width: 0 }} whileInView={{ width: 50 }}
            viewport={{ once: true }}
            className="h-1 bg-gradient-to-r from-indigo-600 to-pink-600 mx-auto mt-2 rounded-full shadow-sm"
          />
        </div>

        {/* Grid - Small Compact Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {subcategories.map((cat, i) => (
            <motion.div key={cat._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link to={`/products?category=Men&subcategory=${cat.name}`}
                className="group relative block overflow-hidden rounded-2xl shadow-sm hover:shadow-md
                           h-28 sm:h-32 bg-white hover:bg-slate-950 transition-colors duration-300 border border-slate-200/80 hover:border-indigo-500/60 flex items-center justify-center flex-col text-center p-3 hover:-translate-y-1"
              >
                {/* Background Subtle Gradient Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600/30 group-hover:text-indigo-300 font-extrabold text-[9px] uppercase tracking-widest mb-1.5 z-10 transition-colors">
                  Collection
                </span>

                <h3 className="text-sm sm:text-base lg:text-lg
                               font-black text-slate-900 group-hover:text-white z-10 capitalize mb-1 transition-colors duration-300 tracking-tight line-clamp-1">
                  {cat.name}
                </h3>

                <span className="text-slate-500 font-extrabold flex items-center gap-1
                                 text-[10px] group-hover:text-pink-400 transition-colors z-10 uppercase tracking-wider mt-0.5">
                  View
                  <ArrowRight size={12}
                    className="group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 lg:py-32 bg-slate-100/70 border-y border-slate-200/80 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-end
                          justify-between gap-4 mb-12 sm:mb-16">
            <div>
              <span className="text-indigo-600 font-extrabold uppercase tracking-widest text-xs mb-1 block">
                Top Rated Apparel
              </span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl
                           font-black text-slate-900 tracking-tighter"
              >
                Featured <span className="text-gradient-vibrant">Arrivals</span>
              </motion.h2>
              <p className="text-slate-500 mt-2 text-sm sm:text-base font-normal">
                Handpicked premium styles from our latest seasonal release.
              </p>
            </div>
            <Link to="/products"
              className="self-start min-[480px]:self-auto
                         group text-slate-900 font-extrabold hover:bg-indigo-600 hover:text-white
                         flex items-center gap-2 text-xs uppercase tracking-widest
                         bg-white px-7 py-3.5 rounded-full border border-slate-300
                         shadow-md shrink-0 transition-all duration-300 hover:shadow-indigo-500/25"
            >
              View All Products
              <ArrowRight size={16}
                className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <AnimatePresence mode="wait">
              {loading
                ? Array(4).fill(0).map((_, i) => (
                    <motion.div key={`sk-${i}`}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="bg-white rounded-3xl overflow-hidden
                                 border border-slate-200 shadow-sm"
                      style={{ height: '360px' }}
                    >
                      <div className="h-[62%] bg-slate-100 animate-pulse" />
                      <div className="p-5 space-y-3">
                        <div className="h-3 bg-slate-100 rounded w-1/3 animate-pulse" />
                        <div className="h-5 bg-slate-100 rounded w-4/5 animate-pulse" />
                        <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse" />
                      </div>
                    </motion.div>
                  ))
                : featuredProducts.map(p => <ProductCard key={p._id} product={p} />)
              }
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          NEWSLETTER — Luxury Ambient Glow Box
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 rounded-3xl sm:rounded-[3rem] p-8 sm:p-14 lg:p-20
                     text-center relative overflow-hidden shadow-2xl shadow-indigo-950/40 border border-slate-800/80"
        >
          {/* Radial light dot pattern background */}
          <div className="absolute inset-0 opacity-[0.06]"
               style={{ backgroundImage: 'radial-gradient(#fff 2px,transparent 2px)',
                        backgroundSize: '40px 40px' }} />

          {/* Ambient Glow Orbs inside card */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-pink-500/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto">
            {/* Rotating mail icon */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-2 border-indigo-400/40 rounded-full
                         mx-auto mb-7 sm:mb-9 flex items-center justify-center bg-indigo-900/40 backdrop-blur-xl shadow-lg shadow-indigo-500/20"
            >
              <Mail className="w-7 h-7 text-indigo-300" />
            </motion.div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl
                           font-black text-white mb-4 sm:mb-5 tracking-tighter leading-tight">
              Join The <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">VIP Club</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg mb-8 sm:mb-10
                          leading-relaxed font-normal">
              Be the first to access limited edition drops, exclusive VIP deals, and signature style releases.
            </p>

            <form className="flex flex-col sm:flex-row gap-3 w-full"
                  onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 bg-white/10 border border-white/20 rounded-full
                           px-6 py-4 text-white placeholder:text-slate-400
                           focus:outline-none focus:ring-2 focus:ring-indigo-400/60
                           transition-all text-sm font-medium min-w-0 backdrop-blur-md"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-9 py-4 rounded-full
                           font-black text-xs uppercase tracking-widest hover:brightness-110
                           transition-all shadow-lg shadow-indigo-500/40 shrink-0"
              >
                Subscribe Now
              </motion.button>
            </form>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-slate-200/80 bg-white relative z-10
                         pt-14 pb-8 sm:pt-18 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Top */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-8 sm:gap-12">

            {/* Brand */}
            <div className="text-center sm:text-left">
              <span className="text-2xl font-black tracking-tight text-slate-900">
                My <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">Wearables</span>
              </span>
              <p className="text-slate-600 font-medium mt-3 max-w-sm text-xs sm:text-sm
                            leading-relaxed mx-auto sm:mx-0">
                Redefining fashion with premium craftsmanship, vibrant aesthetics, and luxury comfort.
              </p>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-10 pt-6 border-t border-slate-100
                          flex flex-col sm:flex-row justify-between items-center gap-4
                          text-xs text-slate-500 font-medium">
            <p>© 2026 My Wearables. All rights reserved.</p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Support Desk'].map(l => (
                <a key={l} href="#" className="hover:text-indigo-600 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── Global CSS ── */}
      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 6s ease infinite;
        }

        /* Custom xs breakpoint (480px) */
        @media (min-width: 480px) {
          .xs\\:text-5xl       { font-size: 3.25rem; line-height: 1.05; }
          .xs\\:flex-row       { flex-direction: row; }
          .xs\\:items-end      { align-items: flex-end; }
          .xs\\:self-auto      { align-self: auto; }
        }

        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
};

export default Home;
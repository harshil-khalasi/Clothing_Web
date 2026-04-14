import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Zap, ShieldCheck, Truck,
  Mail, Instagram, Facebook, Twitter,
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { getAllProducts, getAllSubcategories } from '../services/api';
import ProductCard from '../components/ProductCard';

/* ─────────────────────────────────────────────────────────────────────────────
   HOME PAGE  ·  Fully Responsive (mobile-first)
   320px → 480px → 640px → 768px → 1024px → 1280px → 1536px
───────────────────────────────────────────────────────────────────────────── */

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  /* ── Parallax helpers ── */
  const { scrollYProgress } = useScroll();
  const y1     = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2     = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 60]);

  /* ── Hero slides ── */
  const heroSlides = [
    {
      title:    'Style That Defines',
      subtitle: 'New Collection 2026',
      desc:     'Explore our curated selection of premium clothing designed for comfort and elegance.',
      image:    'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2000',
      accent:   'from-pink-500 via-rose-400 to-pink-600',
    },
    {
      title:    'Urban Ethereal',
      subtitle: "Winter Collection '26",
      desc:     'Minimalist aesthetics meeting maximum comfort. Urban sophistication redefined.',
      image:    'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=2000',
      accent:   'from-blue-500 via-indigo-400 to-blue-600',
    },
    {
      title:    'Pure Organic',
      subtitle: 'Sustainable Living',
      desc:     '100% organic cotton, zero-waste production. Fashion that cares for the planet.',
      image:    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=2000',
      accent:   'from-emerald-500 via-teal-400 to-emerald-600',
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

  /* ── Static data ── */
  const features = [
    { icon: <Zap size={22} />,        title: 'Fast Delivery',   desc: 'Get your orders in 2–3 days' },
    { icon: <ShieldCheck size={22} />, title: 'Secure Payment', desc: 'WhatsApp verified orders' },
    { icon: <Truck size={22} />,       title: 'Free Shipping',  desc: 'On orders over ₹999' },
  ];

  /* ── Animation variants ── */
  const container = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.18 } },
  };
  const item = {
    hidden:  { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: 'easeOut' } },
  };

  /* ═══════════════════════ JSX ═══════════════════════ */
  return (
    <div className="font-sans bg-white overflow-x-hidden relative selection:bg-pink-100 selection:text-pink-600">

      {/* ── Parallax blobs (decorative) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden hidden sm:block">
        <motion.div style={{ y: y1, rotate }}
          className="absolute -top-40 -left-40 w-[480px] lg:w-[650px] h-[480px] lg:h-[650px]
                     bg-pink-100/20 rounded-full blur-[100px]" />
        <motion.div style={{ y: y2 }}
          className="absolute top-1/3 -right-40 w-[400px] lg:w-[580px] h-[400px] lg:h-[580px]
                     bg-blue-50/10 rounded-full blur-[120px]" />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO — Full-viewport slider
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative h-[75vh] sm:h-[85vh] lg:h-[90vh] flex items-center bg-gray-950 overflow-hidden">

        {/* Slide background */}
        <AnimatePresence mode="wait">
          <motion.div key={activeSlide}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            className="absolute inset-0 z-0"
          >
            <motion.img
              src={heroSlides[activeSlide].image} alt="Hero"
              initial={{ scale: 1.15 }} animate={{ scale: 1 }}
              transition={{ duration: 6, ease: 'linear' }}
              className="w-full h-full object-cover opacity-40"
              referrerPolicy="no-referrer"
            />
            {/* Stronger gradient on mobile for readability */}
            <div className="absolute inset-0
                            bg-gradient-to-b from-gray-950/70 via-gray-950/50 to-gray-950/80
                            sm:bg-gradient-to-r sm:from-gray-950 sm:via-gray-950/70 sm:to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Slide content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeSlide}
              initial="hidden" animate="visible" exit="hidden"
              variants={container}
              className="w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl"
            >
              {/* Badge */}
              <motion.div variants={item}>
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10
                                 text-pink-400 font-bold uppercase tracking-widest
                                 text-[9px] sm:text-[10px] mb-5 sm:mb-7">
                  {heroSlides[activeSlide].subtitle}
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1 variants={item}
                className="text-[2.6rem] leading-[1] xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[7rem]
                           font-black text-white mb-5 sm:mb-7 tracking-tighter"
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
                className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl
                           mb-8 sm:mb-10 max-w-sm sm:max-w-md leading-relaxed font-light"
              >
                {heroSlides[activeSlide].desc}
              </motion.p>

              {/* CTAs */}
              <motion.div variants={item}
                className="flex flex-col min-[380px]:flex-row gap-3 sm:gap-4"
              >
                <Link to="/products"
                  className="relative overflow-hidden bg-pink-600 text-white
                             px-7 py-3.5 sm:px-9 sm:py-4 rounded-full
                             font-bold text-sm sm:text-base
                             hover:bg-pink-700 transition-all
                             flex items-center justify-center gap-2
                             group shadow-xl shadow-pink-600/30 active:scale-95"
                >
                  <span className="relative z-10">Shop Now</span>
                  <ArrowRight size={16}
                    className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-white/15 -translate-x-full
                                  group-hover:translate-x-full transition-transform duration-500 ease-in-out" />
                </Link>
                <Link to="/products?featured=true"
                  className="bg-white/8 backdrop-blur-xl text-white border border-white/10
                             px-7 py-3.5 sm:px-9 sm:py-4 rounded-full
                             font-bold text-sm sm:text-base
                             hover:bg-white/15 transition-all text-center active:scale-95"
                >
                  View Lookbook
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot controls */}
        <div className="absolute bottom-6 sm:bottom-9 right-4 sm:right-10 z-20 flex gap-2">
          {heroSlides.map((_, idx) => (
            <button key={idx} onClick={() => setActiveSlide(idx)}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-500
                          ${activeSlide === idx
                            ? 'w-8 sm:w-12 bg-pink-600'
                            : 'w-3 sm:w-4 bg-white/25 hover:bg-white/50'}`}
            />
          ))}
        </div>

        {/* Scroll cue — desktop only */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden lg:flex flex-col items-center gap-2"
        >
          <span className="text-white/20 text-[8px] uppercase tracking-[0.5em] font-black">Scroll</span>
          <div className="w-px h-20 bg-gradient-to-b from-pink-600 to-transparent overflow-hidden">
            <motion.div animate={{ y: [0, 80] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              className="w-full h-1/4 bg-white"
            />
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURES — Glass cards overlapping hero
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                      -mt-8 sm:-mt-14 lg:-mt-18">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={container}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
        >
          {features.map((f, i) => (
            <motion.div key={i} variants={item}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/95 backdrop-blur-2xl
                         rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8
                         shadow-xl shadow-gray-900/8 border border-white/60
                         flex items-center gap-4 sm:gap-5
                         hover:shadow-pink-100/60 transition-all duration-500 group"
            >
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.7 }}
                className="w-12 h-12 sm:w-13 sm:h-13 lg:w-14 lg:h-14
                           bg-pink-50 text-pink-600 rounded-xl sm:rounded-2xl
                           flex items-center justify-center shrink-0
                           group-hover:bg-pink-600 group-hover:text-white transition-all duration-500"
              >
                {f.icon}
              </motion.div>
              <div className="min-w-0">
                <h4 className="font-black text-gray-900 text-sm sm:text-base tracking-tight">
                  {f.title}
                </h4>
                <p className="text-gray-500 text-xs sm:text-sm mt-1 font-light leading-snug">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-22 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10 sm:mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl
                       font-black text-gray-900 tracking-tighter"
          >
            Shop by <span className="text-pink-600">Categories</span>
          </motion.h2>
          <motion.div
            initial={{ width: 0 }} whileInView={{ width: 64 }}
            viewport={{ once: true }}
            className="h-1.5 bg-pink-600 mx-auto mt-4 rounded-full"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {subcategories.map((cat, i) => (
            <motion.div key={cat._id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, delay: i * 0.12 }}
            >
              <Link to={`/products?category=Men&subcategory=${cat.name}`}
                className="group relative block overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl
                           h-56 sm:h-72 lg:h-[300px] bg-pink-50 transition-all border border-pink-100 flex items-center justify-center flex-col text-center"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-transparent group-hover:opacity-75 transition-opacity" />
                <h3 className="text-2xl sm:text-3xl lg:text-4xl
                               font-black text-gray-900 z-10 capitalize mb-2">
                  {cat.name}
                </h3>
                <span className="text-pink-600 font-bold flex items-center gap-2
                                 text-sm sm:text-base group-hover:text-pink-800 transition-colors z-10">
                  Shop Men's {cat.name}
                  <ArrowRight size={15}
                    className="group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FEATURED PRODUCTS — Real backend
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-22 lg:py-28 bg-pink-50/40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col min-[480px]:flex-row min-[480px]:items-end
                          justify-between gap-4 mb-10 sm:mb-14">
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl
                           font-black text-gray-900 tracking-tighter"
              >
                Featured <span className="text-pink-600">Arrivals</span>
              </motion.h2>
              <p className="text-gray-500 mt-2 text-sm sm:text-base font-light">
                Handpicked pieces from our newest drop.
              </p>
            </div>
            <Link to="/products"
              className="self-start min-[480px]:self-auto
                         group text-pink-600 font-bold hover:text-pink-700
                         flex items-center gap-2 text-sm sm:text-base
                         bg-white px-6 py-3 rounded-full
                         shadow-md hover:shadow-pink-100 active:scale-95 shrink-0 transition-all"
            >
              View All
              <ArrowRight size={17}
                className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Products: 1 → 2 → 4 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            <AnimatePresence mode="wait">
              {loading
                ? Array(4).fill(0).map((_, i) => (
                    <motion.div key={`sk-${i}`}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden
                                 border border-gray-100 shadow-sm"
                      style={{ height: '340px' }}
                    >
                      <div className="h-[62%] bg-gray-100 animate-pulse" />
                      <div className="p-5 space-y-3">
                        <div className="h-2.5 bg-gray-100 rounded w-1/3 animate-pulse" />
                        <div className="h-5 bg-gray-100 rounded w-4/5 animate-pulse" />
                        <div className="h-3.5 bg-gray-100 rounded w-1/2 animate-pulse" />
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
          NEWSLETTER
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.9 }}
          className="bg-gray-950 rounded-3xl sm:rounded-[3rem] p-8 sm:p-14 lg:p-20
                     text-center relative overflow-hidden"
        >
          {/* Dot pattern */}
          <div className="absolute inset-0 opacity-[0.04]"
               style={{ backgroundImage: 'radial-gradient(#fff 2px,transparent 2px)',
                        backgroundSize: '50px 50px' }} />

          <div className="relative z-10 max-w-xl mx-auto">
            {/* Rotating mail icon */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
              className="w-14 h-14 border border-pink-500/30 rounded-full
                         mx-auto mb-7 sm:mb-9 flex items-center justify-center"
            >
              <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-pink-500" />
            </motion.div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl
                           font-black text-white mb-4 sm:mb-5 tracking-tighter leading-tight">
              Join The{' '}
              <span className="text-pink-600">Movement</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg mb-8 sm:mb-10
                          leading-relaxed font-light">
              Be the first to know about exclusive drops, offers, and style guides.
            </p>

            <form className="flex flex-col sm:flex-row gap-3 w-full"
                  onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-white/6 border border-white/10 rounded-full
                           px-6 py-3.5 sm:py-4 text-white placeholder:text-gray-600
                           focus:outline-none focus:ring-2 focus:ring-pink-500/40
                           transition-all text-sm sm:text-base font-light min-w-0"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="bg-pink-600 text-white px-8 py-3.5 sm:py-4 rounded-full
                           font-bold text-sm sm:text-base hover:bg-pink-700
                           transition-all shadow-xl shadow-pink-600/35 shrink-0"
              >
                Join Now
              </motion.button>
            </form>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-gray-100 bg-white relative z-10
                         pt-12 pb-8 sm:pt-16 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Top */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-8 sm:gap-12">

            {/* Brand */}
            <div className="text-center sm:text-left">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-gray-900">
                STYLE<span className="text-pink-600">HUB</span>
              </h2>
              <p className="text-gray-500 mt-3 max-w-xs text-sm sm:text-base
                            leading-relaxed font-light mx-auto sm:mx-0">
                Redefining style with premium quality — the fashion revolution is here.
              </p>
            </div>

          

           
          </div>

          {/* Bottom */}
          <div className="mt-8 sm:mt-12 pt-6 border-t border-gray-100
                          flex flex-col sm:flex-row justify-between items-center gap-4
                          text-xs sm:text-sm text-gray-400">
            <p>© 2026 StyleHub. All rights reserved.</p>
            <div className="flex gap-6 font-medium">
              {['Privacy', 'Terms', 'Support'].map(l => (
                <a key={l} href="#" className="hover:text-pink-600 transition-colors">{l}</a>
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
          animation: gradient-x 5s ease infinite;
        }

        /* Custom xs breakpoint (480px) */
        @media (min-width: 480px) {
          .xs\\:text-5xl       { font-size: 3rem; line-height: 1; }
          .xs\\:flex-row       { flex-direction: row; }
          .xs\\:items-end      { align-items: flex-end; }
          .xs\\:self-auto      { align-self: auto; }
        }

        html { scroll-behavior: smooth; }
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        ::-webkit-scrollbar       { width: 5px; }
        ::-webkit-scrollbar-track { background: #f5f5f5; }
        ::-webkit-scrollbar-thumb { background: #db2777; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #be185d; }
      `}</style>
    </div>
  );
};

export default Home;
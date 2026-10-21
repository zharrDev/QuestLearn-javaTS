import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Crosshair, MessageSquare, Trophy, ArrowRight, Sparkles, Globe2, Swords } from 'lucide-react'
import { WORLD_DEFS } from '../config/worlds'

const SLIDES = WORLD_DEFS.map((world) => ({
  label: world.nativeName,
  flag: world.flag,
  gradient: `linear-gradient(160deg, ${world.palette.skyTop} 0%, ${world.palette.skyBottom} 52%, ${world.palette.near} 100%)`,
}))

const SLIDE_DURATION = 4500

export const LandingPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
    }, SLIDE_DURATION)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-pixel-bg">
      <section className="relative overflow-hidden min-h-screen">
        {SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: idx === currentSlide ? 1 : 0, background: slide.gradient }}
          >
            <div className="absolute right-[6%] top-[18%] text-[180px] lg:text-[280px] leading-none opacity-20 select-none">
              {slide.flag}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#141B22] to-transparent" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-pixel-bg" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-pixel-amber/10 border-2 border-pixel-amber/30 font-pixel text-[8px] text-pixel-amber tracking-wider">
              <Sparkles size={12} />
              TYPING COMBAT GAME 2D · 6 BAHASA
            </div>
            <h1 className="font-pixel text-[20px] lg:text-[28px] text-pixel-cream leading-[2] mt-8 text-shadow-pixel">
              Latihan mengetik jadi<br />pertarungan epik<br />
              <span className="text-pixel-amber">2D!</span>
            </h1>
            <p className="font-vt text-2xl text-pixel-cream/70 mt-6 leading-relaxed max-w-[520px]">
              Pilih bahasamu — Inggris, Indonesia, Spanyol, Prancis, Jerman, atau Portugis —
              lalu tebas kotak huruf dengan ketikan cepat. Kumpulkan XP, kejar WPM tertinggi,
              dan buktikan kamu pengetik tercepat di dunia!
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/register">
                <Button size="lg">
                  MULAI GRATIS <ArrowRight size={14} className="ml-1" />
                </Button>
              </Link>
              <Link to="/typing">
                <Button variant="ghost" size="lg">COBA TYPING</Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6">
              <div className="flex -space-x-3">
                {['W', 'M', 'K', 'S'].map((c, i) => (
                  <div key={i} className="w-9 h-9 border-2 border-pixel-bg bg-pixel-panel flex items-center justify-center font-pixel text-[7px] text-pixel-cream/60">
                    {c}
                  </div>
                ))}
              </div>
              <p className="font-vt text-lg text-pixel-cream/50">
                <span className="text-pixel-cream">6 bahasa</span> siap dimainkan
              </p>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="pixel-panel p-6 border-pixel-cream/30 -rotate-1">
              <div className="flex justify-between items-center">
                <h3 className="font-pixel text-[10px] text-pixel-cream">
                  TYPING STRIKE — STATS
                </h3>
                <span className="font-pixel text-[7px] bg-pixel-green/20 text-pixel-green border border-pixel-green/30 px-2 py-1">
                  LIVE
                </span>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { label: 'Bahasa Dunia', value: '6', color: '#6FCF6F' },
                  { label: 'Tingkat Kesulitan', value: '3', color: '#8FC1D9' },
                  { label: 'Kata & Frasa', value: '419', color: '#E8A93B' },
                  { label: 'Aset Gambar Eksternal', value: '0', color: '#E37B6B' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border-2 border-pixel-cream/10 bg-pixel-dark/30">
                    <span className="font-pixel text-[8px] text-pixel-cream/60">{s.label}</span>
                    <span className="font-pixel text-[10px]" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 pixel-panel bg-pixel-green/10 border-pixel-green/40 p-4 rotate-[-3deg] max-w-[200px]">
              <p className="font-pixel text-[7px] text-pixel-green/70">
                MAP PROCEDURAL
              </p>
              <p className="font-vt text-base text-pixel-cream mt-1">
                Tebing, karakter & kotak digambar sendiri.
              </p>
            </div>
            <div className="absolute -top-4 -right-4 pixel-panel bg-pixel-amber/20 border-pixel-amber/40 px-4 py-2 rotate-3">
              <span className="font-pixel text-[8px] text-pixel-amber">
                +XP SETIAP SESI
              </span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {SLIDES.map((slide, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 border-2 transition-all duration-300 ${
                idx === currentSlide
                  ? 'bg-pixel-amber border-pixel-amber scale-125'
                  : 'bg-transparent border-pixel-cream/30 hover:border-pixel-cream/60'
              }`}
              aria-label={slide.label}
            />
          ))}
        </div>
      </section>

      <section className="border-y-3 border-[#2A3444] py-16 bg-pixel-dark/30">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-pixel text-[14px] text-pixel-cream text-center text-shadow-pixel">
            Kenapa Typing Strike?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              {
                icon: <Crosshair size={28} className="text-pixel-amber" />,
                title: 'Lock-On Combat',
                desc: 'Ketik huruf pertama untuk lock-on musuh, lalu tebas dengan ketikan selanjutnya. Mekanik combat unik yang bikin latihan ngetik terasa seru.',
              },
              {
                icon: <MessageSquare size={28} className="text-pixel-green" />,
                title: 'Latihan Efektif',
                desc: 'Lawan kata/kalimat dari 6 bahasa dunia. Ukur WPM dan akurasi secara real-time. Cocok untuk semua level kemampuan.',
              },
              {
                icon: <Trophy size={28} className="text-pixel-coral" />,
                title: 'Gamifikasi Nyata',
                desc: 'Dapatkan XP, streak, dan badge berdasarkan performa typing-mu. Naikkan ranking di leaderboard!',
              },
            ].map((f) => (
              <div key={f.title} className="pixel-panel p-6 hover:translate-y-[-2px] transition-all">
                <div className="mb-3">{f.icon}</div>
                <h3 className="font-pixel text-[10px] text-pixel-cream">{f.title}</h3>
                <p className="font-vt text-lg text-pixel-cream/50 mt-2">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="font-pixel text-[14px] text-pixel-cream text-shadow-pixel flex items-center gap-2">
            <Globe2 size={20} className="text-pixel-amber" /> 6 Dunia Bahasa dari Seluruh Dunia
          </h2>
          <span className="font-pixel text-[7px] text-pixel-cream/35">LEBIH BANYAK BAHASA SEGERA</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {WORLD_DEFS.map((d) => (
            <div key={d.slug} className="pixel-panel p-0 overflow-hidden pixel-card-hover cursor-pointer transition-all">
              <div className="h-2" style={{ backgroundColor: d.color }} />
              <div className="p-5">
                <div className="mb-3 text-3xl">{d.flag}</div>
                <h3 className="font-pixel text-[11px] text-pixel-cream">{d.nativeName}</h3>
                <p className="font-vt text-lg text-pixel-cream/50 mt-2">{d.description}</p>
                <p className="font-pixel text-[7px] mt-4" style={{ color: d.color }}>
                  3 LEVEL KESULITAN
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/register">
            <Button size="lg">MULAI PETUALANGANMU</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t-3 border-[#2A3444] py-10 text-center">
        <p className="font-pixel text-[8px] text-pixel-cream/30">
          QuestLearn — Platform Belajar Berbasis Game &bull; Proyekan S1 &bull;
          Bandung, 2026
        </p>
        <p className="font-vt text-base text-pixel-cream/20 mt-2">
          Demo: siswa@demo.id / demo123 &bull; Admin: admin@questlearn.id /
          admin123
        </p>
      </footer>
    </div>
  )
}

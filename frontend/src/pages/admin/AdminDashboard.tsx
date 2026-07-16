import React from 'react'
import { Card } from '../../components/common/Card'
import { Link } from 'react-router-dom'
import { Users, Globe, BarChart3, Award, Map, BookOpen } from 'lucide-react'
export const AdminDashboard: React.FC = () => {
  const stats={ users:27, dunia:3, level:18, soal:144, badge:10 }
  return <div className="max-w-6xl mx-auto px-4 py-8">
    <div className="font-pixel text-[8px] text-pixel-green tracking-widest mb-2">ADMIN PANEL</div>
    <h1 className="font-pixel text-[16px] text-pixel-cream text-shadow-pixel">KONTROL QUESTLEARN</h1>
    <p className="font-vt text-xl text-pixel-cream/50 mt-2">Kelola konten platform</p>
    <div className="grid md:grid-cols-5 gap-4 mt-6">
      {[
        { label: "USERS", value: stats.users, icon: <Users size={24} /> },
        { label: "DUNIA", value: stats.dunia, icon: <Globe size={24} /> },
        { label: "LEVEL", value: stats.level, icon: <BarChart3 size={24} /> },
        { label: "SOAL", value: stats.soal, icon: <span className="font-pixel text-[14px]">?</span> },
        { label: "BADGE", value: stats.badge, icon: <Award size={24} /> },
      ].map(s => (
        <div key={s.label} className="pixel-panel p-4">
          <p className="font-pixel text-[7px] text-pixel-cream/40">{s.label}</p>
          <p className="font-pixel text-[14px] text-pixel-cream mt-2 flex items-center gap-2">{s.icon} {s.value}</p>
        </div>
      ))}
    </div>
    <div className="grid md:grid-cols-3 gap-4 mt-8">
      {[
        { to: "/admin/dunia", title: <><Globe size={16} className="inline-block mr-1" /> KELOLA DUNIA</>, desc: "CRUD kategori mapel", color: "village-terracotta" },
        { to: "/admin/level", title: <><Map size={16} className="inline-block mr-1" /> KELOLA LEVEL</>, desc: "Urutan & XP reward", color: "desert-sand" },
        { to: "/admin/soal", title: <><span className="font-pixel text-[8px]">?</span> KELOLA SOAL</>, desc: "144 soal + upload gambar", color: "pixel-amber" },
        { to: "/admin/badge", title: <><Award size={16} className="inline-block mr-1" /> KELOLA BADGE</>, desc: "Syarat unlock otomatis", color: "pixel-green" },
        { to: "/admin/users", title: <><Users size={16} className="inline-block mr-1" /> LIHAT USER</>, desc: "Statistik & leaderboard", color: "village-sky" },
        { to: "/api-docs", title: <><BookOpen size={16} className="inline-block mr-1" /> API DOCS</>, desc: "Swagger/OpenAPI", color: "forest-lantern" },
      ].map(item => (
        <Link key={item.to} to={item.to}>
          <div className="pixel-panel p-5 pixel-card-hover cursor-pointer transition-all">
            <h3 className="font-pixel text-[9px] text-pixel-cream">{item.title}</h3>
            <p className="font-vt text-base text-pixel-cream/40 mt-1">{item.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  </div>
}

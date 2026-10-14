import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { progressService } from '../../services/progress.service'
import { Dashboard } from '../../types/progress.types'
import { mockLeaderboard } from '../../services/mockData'
import {
  Zap,
  Flame,
  Target,
  Award,
  ArrowRight,
  Trophy,
  Medal,
  Crown,
  Globe,
  Calculator,
  Brain,
  Swords,
} from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    progressService
      .getDashboard()
      .then((res) => setData(res.data.data))
      .catch(() => {
        setData({
          totalXp: 1240,
          currentStreak: 3,
          longestStreak: 5,
          completedLevels: 3,
          totalLevels: 18,
          totalBadges: 3,
          continueLearning: [
            { id: 1, nama: 'Target 40 WPM', deskripsi: 'Capai 40 kata per menit di Easy' },
            { id: 2, nama: 'Akurasi 100%', deskripsi: 'Selesaikan sesi tanpa salah ketik' },
          ],
          recentBadges: [
            { id: 1, nama: 'Langkah Pertama', kode: 'FIRST_STEP', deskripsi: 'Selesaikan sesi typing pertamamu!', warna: '#6FCF6F', earned: true, earnedAt: new Date().toISOString() },
            { id: 2, nama: 'Pengetik Cepat', kode: 'STREAK_3', deskripsi: 'Capai 40 WPM', warna: '#E8A93B', earned: true },
          ],
          leaderboardWeekly: mockLeaderboard,
        })
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-10 flex justify-center">
      <div className="font-pixel text-[10px] text-pixel-amber animate-pixel-pulse">LOADING...</div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-pixel text-[16px] text-pixel-cream text-shadow-pixel">DASHBOARD</h1>
        <p className="font-vt text-xl text-pixel-cream/50 mt-2">Ringkasan progress typing kamu hari ini</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'TOTAL XP', value: data?.totalXp, icon: <Zap size={18} className="text-pixel-amber" />, extra: '+12 XP hari ini' },
          { label: 'STREAK', value: `${data?.currentStreak} HARI`, icon: <Flame size={18} className="text-pixel-coral" />, extra: `Terpanjang: ${data?.longestStreak} hari` },
          { label: 'BADGE', value: data?.totalBadges, icon: <Award size={18} className="text-village-sky" />, extra: `${data?.recentBadges?.length || 0} terbaru` },
          { label: 'TARGET', value: `${data?.completedLevels} / ${data?.totalLevels}`, icon: <Target size={18} className="text-pixel-green" />, extra: 'level kesulitan' },
        ].map((s) => (
          <div key={s.label} className="pixel-panel p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-pixel text-[7px] text-pixel-cream/40">{s.label}</p>
                <p className="font-pixel text-[14px] text-pixel-cream mt-2">{s.value}</p>
              </div>
              <div className="w-10 h-10 flex items-center justify-center border-2 bg-pixel-amber/20 border-pixel-amber/30">
                {s.icon}
              </div>
            </div>
            <p className="font-vt text-sm text-pixel-cream/30 mt-2">{s.extra}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="pixel-panel overflow-hidden p-0">
            <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-green-900/30 via-green-800/20 to-emerald-900/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center border-2 border-green-400 bg-green-400/20">
                  <Swords size={24} className="text-green-400" />
                </div>
                <div>
                  <h3 className="font-pixel text-[10px] text-green-400">TYPING STRIKE!</h3>
                  <p className="font-vt text-sm text-pixel-cream/50">
                    Latihan mengetik side-scroller 2D — kalahkan kotak huruf dengan kecepatan & akurasi!
                  </p>
                </div>
              </div>
              <Link to="/typing" className="pixel-btn" style={{background: '#16a34a', color: '#fff', border: '2px solid #22c55e'}}>
                MULAI TYPING <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h2 className="font-pixel text-[11px] text-pixel-cream">TARGET TYPING</h2>
          </div>
          <div className="space-y-3">
            {data?.continueLearning?.map((item) => (
              <Link key={item.id} to="/typing" className="block pixel-panel p-4 flex items-center gap-4 pixel-card-hover cursor-pointer transition-all">
                <div className="w-14 h-14 flex items-center justify-center border-2 border-pixel-amber/30 bg-pixel-amber/10">
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-pixel text-[9px] text-pixel-cream mt-1">{item.nama}</h3>
                  <p className="font-vt text-sm text-pixel-cream/40">{item.deskripsi}</p>
                </div>
                <span className="text-pixel-amber"><ArrowRight size={14} /></span>
              </Link>
            ))}
          </div>

          <h2 className="font-pixel text-[11px] text-pixel-cream mt-8">PILIH DUNIA TYPING</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { id: 1, nama: 'Bahasa Inggris', deskripsi: 'Kata & frasa Inggris', color: '#B5533C', icon: <Globe size={32} /> },
              { id: 2, nama: 'Matematika Dasar', deskripsi: 'Angka & persamaan', color: '#D9A24B', icon: <Calculator size={32} /> },
              { id: 3, nama: 'Logika & Umum', deskripsi: 'Teka-teki & logika', color: '#6FCF6F', icon: <Brain size={32} /> },
            ].map((d) => (
              <Link key={d.id} to="/typing" className="group">
                <div className="pixel-panel p-4 h-full pixel-card-hover cursor-pointer transition-all">
                  <div className="mb-3 flex justify-center" style={{ color: d.color }}>{d.icon}</div>
                  <h3 className="font-pixel text-[9px] text-pixel-cream">{d.nama}</h3>
                  <p className="font-vt text-base text-pixel-cream/40 mt-1">{d.deskripsi}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="pixel-panel p-5">
            <h3 className="font-pixel text-[9px] text-pixel-cream mb-4">BADGE TERBARU</h3>
            <div className="space-y-3">
              {data?.recentBadges?.map((b) => (
                <div key={b.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center border-2" style={{ backgroundColor: b.warna, borderColor: b.warna }}>
                    <Medal size={16} className="text-pixel-navy" />
                  </div>
                  <div>
                    <p className="font-pixel text-[8px] text-pixel-cream">{b.nama}</p>
                    <p className="font-vt text-sm text-pixel-cream/40">{b.deskripsi}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/profile" className="mt-4 block text-center font-pixel text-[7px] text-pixel-amber hover:underline">LIHAT SEMUA</Link>
          </div>

          <div className="pixel-panel p-5">
            <h3 className="font-pixel text-[9px] text-pixel-cream mb-4">LEADERBOARD</h3>
            <div className="space-y-2.5">
              {data?.leaderboardWeekly?.slice(0, 5).map((entry) => (
                <div key={entry.userId} className="flex items-center gap-3">
                  <span className="w-6 text-center">
                    {entry.rank <= 3 ? (
                      <Crown size={14} className={entry.rank === 1 ? 'text-pixel-amber' : entry.rank === 2 ? 'text-pixel-cream/60' : 'text-pixel-coral/60'} />
                    ) : (
                      <span className="font-pixel text-[8px] text-pixel-cream/40">#{entry.rank}</span>
                    )}
                  </span>
                  <div className="w-8 h-8 bg-pixel-panel-light border border-[#2A3444] flex items-center justify-center font-pixel text-[7px]">{entry.nama[0]}</div>
                  <div className="flex-1">
                    <p className="font-vt text-base text-pixel-cream">{entry.nama}</p>
                    <p className="font-pixel text-[6px] text-pixel-amber">{Math.round(entry.wpm ?? 0)} WPM</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/leaderboard" className="mt-4 block text-center font-pixel text-[7px] py-2 bg-pixel-dark border border-[#2A3444] text-pixel-cream/60 hover:text-pixel-cream">LENGKAP</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { progressService } from '../../services/progress.service'
import { Dashboard } from '../../types/progress.types'
import { mockDunia, mockLeaderboard } from '../../services/mockData'
import {
  Zap,
  Flame,
  Target,
  Award,
  Gamepad2,
  ArrowRight,
  Castle,
  Mountain,
  TreePine,
  Trophy,
  Medal,
  Crown,
  Star,
  ChevronRight,
} from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    progressService
      .getDashboard()
      .then((res) => {
        setData(res.data.data)
      })
      .catch(() => {
        setData({
          totalXp: 240,
          currentStreak: 3,
          longestStreak: 5,
          completedLevels: 3,
          totalLevels: 18,
          totalBadges: 3,
          continueLearning: [
            {
              id: 3, duniaId: 1, duniaNama: 'Bahasa Inggris',
              nama: 'Vocabulary Menengah', deskripsi: 'Kata sifat & kerja umum',
              urutan: 3, xpReward: 70, minScoreLulus: 70, isBossLevel: false,
              isActive: true, totalSoal: 8, status: 'OPEN',
            },
            {
              id: 7, duniaId: 2, duniaNama: 'Matematika Dasar',
              nama: 'Operasi Hitung Dasar', deskripsi: 'Tambah & kurang cepat',
              urutan: 1, xpReward: 50, minScoreLulus: 70, isBossLevel: false,
              isActive: true, totalSoal: 8, status: 'OPEN',
            },
          ],
          recentBadges: [
            {
              id: 1, nama: 'Langkah Pertama', kode: 'FIRST_STEP',
              deskripsi: 'Selesaikan level pertamamu!', warna: '#6FCF6F',
              earned: true, earnedAt: new Date().toISOString(),
            },
            {
              id: 2, nama: 'Pembelajar Konsisten', kode: 'STREAK_3',
              deskripsi: '3 hari berturut', warna: '#E8A93B', earned: true,
            },
          ],
          leaderboardWeekly: mockLeaderboard,
        })
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <div className="p-10 flex justify-center">
        <div className="font-pixel text-[10px] text-pixel-amber animate-pixel-pulse">
          LOADING...
        </div>
      </div>
    )

  const worldIcons: Record<number, React.ReactNode> = {
    1: <Castle size={20} className="text-village-terracotta" />,
    2: <Mountain size={20} className="text-desert-sand" />,
    3: <TreePine size={20} className="text-forest-lantern" />,
  }

  const worldColors: Record<number, string> = {
    1: '#B5533C',
    2: '#D9A24B',
    3: '#E8A93B',
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-pixel text-[16px] text-pixel-cream text-shadow-pixel">
          DASHBOARD
        </h1>
        <p className="font-vt text-xl text-pixel-cream/50 mt-2">
          Ringkasan progress belajar kamu hari ini
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'TOTAL XP',
            value: data?.totalXp,
            icon: <Zap size={18} className="text-pixel-amber" />,
            color: 'pixel-amber',
            extra: '+12 XP hari ini',
          },
          {
            label: 'STREAK',
            value: `${data?.currentStreak} HARI`,
            icon: <Flame size={18} className="text-pixel-coral" />,
            color: 'pixel-coral',
            extra: `Terpanjang: ${data?.longestStreak} hari`,
          },
          {
            label: 'LEVEL',
            value: `${data?.completedLevels}/${data?.totalLevels}`,
            icon: <Target size={18} className="text-pixel-green" />,
            color: 'pixel-green',
            extra: null,
            progress:
              ((data?.completedLevels || 0) / (data?.totalLevels || 1)) * 100,
          },
          {
            label: 'BADGE',
            value: data?.totalBadges,
            icon: <Award size={18} className="text-village-sky" />,
            color: 'village-sky',
            extra: `${data?.recentBadges?.length || 0} terbaru`,
          },
        ].map((s) => (
          <div key={s.label} className="pixel-panel p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-pixel text-[7px] text-pixel-cream/40">
                  {s.label}
                </p>
                <p className="font-pixel text-[14px] text-pixel-cream mt-2">
                  {s.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 flex items-center justify-center border-2 bg-${s.color}/20 border-${s.color}/30`}
              >
                {s.icon}
              </div>
            </div>
            {s.extra && (
              <p className="font-vt text-sm text-pixel-cream/30 mt-2">
                {s.extra}
              </p>
            )}
            {'progress' in s && s.progress !== undefined && (
              <div className="pixel-progress mt-3">
                <div
                  className="pixel-progress-fill bg-pixel-green"
                  style={{ width: `${s.progress}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* RPG Mode Banner */}
          <div className="pixel-panel overflow-hidden p-0">
            <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-pixel-amber/10 via-pixel-green/10 to-village-sky/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center border-2 border-pixel-amber bg-pixel-amber/20">
                  <Gamepad2 size={22} className="text-pixel-amber" />
                </div>
                <div>
                  <h3 className="font-pixel text-[10px] text-pixel-cream">
                    MODE RPG 2D!
                  </h3>
                  <p className="font-vt text-sm text-pixel-cream/50">
                    Jelajahi 3 dunia dengan karakter custom
                  </p>
                </div>
              </div>
              <Link to="/rpg" className="pixel-btn pixel-btn-primary">
                MAIN RPG <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Continue Learning */}
          <div className="flex justify-between items-center">
            <h2 className="font-pixel text-[11px] text-pixel-cream">
              LANJUTKAN BELAJAR
            </h2>
            <Link
              to="/worldmap"
              className="font-vt text-base text-pixel-amber hover:underline flex items-center gap-1"
            >
              Lihat semua <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {data?.continueLearning?.map((lvl) => (
              <div
                key={lvl.id}
                className="pixel-panel p-4 flex items-center gap-4 pixel-card-hover cursor-pointer transition-all"
              >
                <div className="w-14 h-14 flex items-center justify-center border-2 border-pixel-amber/30 bg-pixel-amber/10">
                  {worldIcons[lvl.duniaId] || <Star size={20} />}
                </div>
                <div className="flex-1">
                  <p className="font-pixel text-[7px] text-pixel-cream/40 uppercase">
                    {lvl.duniaNama}
                  </p>
                  <h3 className="font-pixel text-[9px] text-pixel-cream mt-1">
                    {lvl.nama}
                  </h3>
                  <p className="font-vt text-sm text-pixel-cream/40">
                    {lvl.deskripsi}
                  </p>
                </div>
                <Link
                  to={`/quest/${lvl.id}`}
                  className="pixel-btn pixel-btn-primary"
                >
                  LANJUT
                </Link>
              </div>
            ))}
          </div>

          {/* World Selection */}
          <h2 className="font-pixel text-[11px] text-pixel-cream mt-8">
            PILIH DUNIA BELAJAR
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {mockDunia.map((d) => (
              <Link key={d.id} to="/worldmap" className="group">
                <div className="pixel-panel p-4 h-full pixel-card-hover cursor-pointer transition-all">
                  <div className="mb-3" style={{ color: worldColors[d.id] || '#E8A93B' }}>
                    {worldIcons[d.id] || <Star size={24} />}
                  </div>
                  <h3 className="font-pixel text-[9px] text-pixel-cream">
                    {d.nama}
                  </h3>
                  <p className="font-vt text-base text-pixel-cream/40 mt-1 line-clamp-2">
                    {d.deskripsi}
                  </p>
                  <div className="pixel-progress mt-3">
                    <div
                      className="pixel-progress-fill"
                      style={{
                        width: `${((d.completedLevel || 0) / (d.totalLevel || 1)) * 100}%`,
                        backgroundColor: worldColors[d.id],
                      }}
                    />
                  </div>
                  <p className="font-pixel text-[6px] text-pixel-cream/30 mt-1">
                    {d.completedLevel}/{d.totalLevel} LEVEL
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Badges */}
          <div className="pixel-panel p-5">
            <h3 className="font-pixel text-[9px] text-pixel-cream mb-4">
              BADGE TERBARU
            </h3>
            <div className="space-y-3">
              {data?.recentBadges?.map((b) => (
                <div key={b.id} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 flex items-center justify-center border-2"
                    style={{
                      backgroundColor: b.warna,
                      borderColor: b.warna,
                    }}
                  >
                    <Medal size={16} className="text-pixel-navy" />
                  </div>
                  <div>
                    <p className="font-pixel text-[8px] text-pixel-cream">
                      {b.nama}
                    </p>
                    <p className="font-vt text-sm text-pixel-cream/40">
                      {b.deskripsi}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/profile"
              className="mt-4 block text-center font-pixel text-[7px] text-pixel-amber hover:underline"
            >
              LIHAT SEMUA
            </Link>
          </div>

          {/* Leaderboard */}
          <div className="pixel-panel p-5">
            <h3 className="font-pixel text-[9px] text-pixel-cream mb-4">
              LEADERBOARD
            </h3>
            <div className="space-y-2.5">
              {data?.leaderboardWeekly?.slice(0, 5).map((entry) => (
                <div key={entry.userId} className="flex items-center gap-3">
                  <span className="w-6 text-center">
                    {entry.rank <= 3 ? (
                      <Crown
                        size={14}
                        className={
                          entry.rank === 1
                            ? 'text-pixel-amber'
                            : entry.rank === 2
                            ? 'text-pixel-cream/60'
                            : 'text-pixel-coral/60'
                        }
                      />
                    ) : (
                      <span className="font-pixel text-[8px] text-pixel-cream/40">
                        #{entry.rank}
                      </span>
                    )}
                  </span>
                  <div className="w-8 h-8 bg-pixel-panel-light border border-[#2A3444] flex items-center justify-center font-pixel text-[7px]">
                    {entry.nama[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-vt text-base text-pixel-cream">
                      {entry.nama}
                    </p>
                    <p className="font-pixel text-[6px] text-pixel-amber">
                      {entry.totalXp} XP
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/leaderboard"
              className="mt-4 block text-center font-pixel text-[7px] py-2 bg-pixel-dark border border-[#2A3444] text-pixel-cream/60 hover:text-pixel-cream"
            >
              LENGKAP
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

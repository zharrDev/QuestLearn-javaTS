import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LeaderboardEntry } from '../../types/leaderboard.types'
import { typingService } from '../../services/typing.service'
import { duniaService } from '../../services/dunia.service'
import { WORLD_BY_SLUG, WORLD_DEFS } from '../../config/worlds'
import { Crown, Medal, Award } from 'lucide-react'

type Filter = 'all' | number

interface FilterOption {
  value: number
  label: string
  flag: string
}

const RankIcon: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1) return <Crown size={14} className="inline-block text-pixel-amber" />
  if (rank === 2) return <Medal size={14} className="inline-block text-[#8A8A8A]" />
  if (rank === 3) return <Award size={14} className="inline-block text-desert-pyramid" />
  return <span className="font-pixel text-[8px]">#{rank}</span>
}

export const LeaderboardPage: React.FC = () => {
  const [filter, setFilter] = useState<Filter>('all')
  const [filters, setFilters] = useState<FilterOption[]>([])
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    duniaService
      .getAllForUser()
      .then((res) => {
        const list = res.data?.data || res.data || []
        if (!Array.isArray(list)) return
        const mapped = list
          .map((d: { id: number; slug: string; nama: string; isActive?: boolean }) => {
            const def = WORLD_BY_SLUG[d.slug]
            return def && d.isActive !== false ? { value: d.id, label: def.name.toUpperCase(), flag: def.flag } : null
          })
          .filter((o): o is FilterOption => o !== null)
        if (mapped.length > 0) setFilters(mapped)
      })
      .catch(() => {
        setFilters(WORLD_DEFS.map((def, index) => ({ value: index + 1, label: def.name.toUpperCase(), flag: def.flag })))
      })
  }, [])

  useEffect(() => {
    setLoading(true)
    typingService
      .getLeaderboard(filter === 'all' ? undefined : filter)
      .then((res) => setData(res || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="font-pixel text-[16px] text-pixel-cream text-shadow-pixel">LEADERBOARD</h1>
        <p className="font-vt text-xl text-pixel-cream/50 mt-2">Peringkat berdasarkan WPM terbaik tiap pemain</p>
        <div className="mt-4 inline-flex flex-wrap justify-center gap-1 bg-pixel-panel border-2 border-[#2A3444] p-1">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 font-pixel text-[8px] transition ${
              filter === 'all' ? 'bg-pixel-amber text-pixel-navy' : 'text-pixel-cream/50 hover:text-pixel-cream'
            }`}
          >
            ALL
          </button>
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 font-pixel text-[8px] transition ${
                filter === f.value ? 'bg-pixel-amber text-pixel-navy' : 'text-pixel-cream/50 hover:text-pixel-cream'
              }`}
            >
              {f.flag} {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="font-pixel text-[10px] text-pixel-amber animate-pixel-pulse">LOADING...</div>
        </div>
      ) : data.length === 0 ? (
        <div className="pixel-panel p-8 text-center">
          <p className="font-pixel text-[9px] text-pixel-cream/60">Belum ada sesi typing di peringkat ini.</p>
          <Link
            to="/typing"
            className="inline-block mt-4 px-4 py-2 bg-pixel-amber text-pixel-navy font-pixel text-[8px]"
          >
            MAIN TYPING SEKARANG
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3 mb-6">
            {data.slice(0, 3).map((entry) => (
              <div
                key={entry.userId}
                className={`text-center pixel-panel p-4 ${
                  entry.rank === 1
                    ? 'border-pixel-amber animate-glow-amber order-2'
                    : entry.rank === 2
                      ? 'border-[#8A8A8A] order-1 mt-4'
                      : 'border-desert-pyramid order-3 mt-6'
                }`}
              >
                <div className="text-2xl">
                  {entry.rank === 1 ? (
                    <Crown size={28} className="inline-block text-pixel-amber" />
                  ) : entry.rank === 2 ? (
                    <Medal size={28} className="inline-block text-[#8A8A8A]" />
                  ) : (
                    <Award size={28} className="inline-block text-desert-pyramid" />
                  )}
                </div>
                <div
                  className="w-14 h-14 mx-auto mt-2 bg-pixel-dark border-2 border-[#2A3444] flex items-center justify-center font-pixel text-lg"
                  style={{ borderColor: entry.rank === 1 ? '#E8A93B' : '#2A3444' }}
                >
                  {entry.nama[0]}
                </div>
                <p className="font-pixel text-[8px] text-pixel-cream mt-2 truncate">{entry.nama}</p>
                <p className="font-pixel text-[10px] text-pixel-amber mt-1">{Math.round(entry.wpm ?? 0)} WPM</p>
                <p className="font-vt text-sm text-pixel-cream/40">akurasi {Math.round(entry.akurasi ?? 0)}%</p>
              </div>
            ))}
          </div>

          <div className="pixel-panel p-2">
            {data.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-3 p-3 border-b border-[#2A3444] last:border-b-0 ${
                  entry.rank <= 3 ? 'bg-pixel-amber/5' : 'hover:bg-pixel-dark/50'
                }`}
              >
                <span className="w-8 text-center text-pixel-cream/60">
                  <RankIcon rank={entry.rank} />
                </span>
                <div className="w-10 h-10 bg-pixel-panel-light border border-[#2A3444] flex items-center justify-center font-pixel text-[9px]">
                  {entry.nama[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-vt text-lg text-pixel-cream truncate">{entry.nama}</p>
                  <p className="font-pixel text-[6px] text-pixel-cream/30">
                    {entry.duniaNama ? entry.duniaNama.toUpperCase() : 'SEMUA DUNIA'}
                  </p>
                </div>
                <span className="font-pixel text-[8px] px-3 py-1 bg-pixel-amber/15 text-pixel-amber border border-pixel-amber/20 whitespace-nowrap">
                  {Math.round(entry.wpm ?? 0)} WPM
                </span>
                <span className="font-pixel text-[7px] text-pixel-cream/40 hidden sm:inline whitespace-nowrap">
                  {Math.round(entry.akurasi ?? 0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

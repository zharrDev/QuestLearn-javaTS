import React, { useEffect, useState } from 'react'
import { LeaderboardEntry } from '../../types/leaderboard.types'
import { progressService } from '../../services/progress.service'
import { mockLeaderboard } from '../../services/mockData'
import { Crown, Medal, Award } from 'lucide-react'
export const LeaderboardPage: React.FC = () => {
  const [filter, setFilter] = useState<'weekly'|'monthly'|'all'>('weekly')
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(()=>{ setLoading(true); progressService.getPublicLeaderboard(filter).then(res=>{ setData(res.data.data) }).catch(()=>setData(mockLeaderboard)).finally(()=>setLoading(false)) },[filter])
  return <div className="max-w-3xl mx-auto px-4 py-8">
    <div className="text-center mb-8">
      <h1 className="font-pixel text-[16px] text-pixel-cream text-shadow-pixel">LEADERBOARD</h1>
      <p className="font-vt text-xl text-pixel-cream/50 mt-2">Siapa pembelajar paling konsisten?</p>
      <div className="mt-4 inline-flex bg-pixel-panel border-2 border-[#2A3444] p-1">
        {(['weekly','monthly','all'] as const).map(f => (
          <button key={f} onClick={()=>setFilter(f)} className={`px-4 py-1.5 font-pixel text-[8px] transition ${
            filter===f ? 'bg-pixel-amber text-pixel-navy' : 'text-pixel-cream/50 hover:text-pixel-cream'
          }`}>{f==='weekly'?'MINGGUAN':f==='monthly'?'BULANAN':'ALL TIME'}</button>
        ))}
      </div>
    </div>
    {loading ? <div className="flex justify-center py-10"><div className="font-pixel text-[10px] text-pixel-amber animate-pixel-pulse">LOADING...</div></div> : (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {data.slice(0,3).map(entry => (
            <div key={entry.userId} className={`text-center pixel-panel p-4 ${
              entry.rank===1 ? 'border-pixel-amber animate-glow-amber order-2' :
              entry.rank===2 ? 'border-[#8A8A8A] order-1 mt-4' :
              'border-desert-pyramid order-3 mt-6'
            }`}>
              <div className="text-2xl">{entry.rank===1 ? <Crown size={28} className="inline-block text-pixel-amber" /> : entry.rank===2 ? <Medal size={28} className="inline-block text-[#8A8A8A]" /> : <Award size={28} className="inline-block text-desert-pyramid" />}</div>
              <div className="w-14 h-14 mx-auto mt-2 bg-pixel-dark border-2 border-[#2A3444] flex items-center justify-center font-pixel text-lg" style={{borderColor: entry.rank===1?'#E8A93B':'#2A3444'}}>{entry.nama[0]}</div>
              <p className="font-pixel text-[8px] text-pixel-cream mt-2 truncate">{entry.nama}</p>
              <p className="font-pixel text-[9px] text-pixel-amber mt-1">{entry.totalXp} XP</p>
            </div>
          ))}
        </div>
        <div className="pixel-panel p-2">
          {data.map(entry => (
            <div key={entry.userId} className={`flex items-center gap-3 p-3 border-b border-[#2A3444] last:border-b-0 ${entry.rank<=3 ? 'bg-pixel-amber/5' : 'hover:bg-pixel-dark/50'}`}>
              <span className="font-pixel text-[8px] w-8 text-center text-pixel-cream/60">{entry.rank<=3 ? [<Crown key="c" size={14} className="inline-block text-pixel-amber" />, <Medal key="m" size={14} className="inline-block text-[#8A8A8A]" />, <Award key="a" size={14} className="inline-block text-desert-pyramid" />][entry.rank-1] : `#${entry.rank}`}</span>
              <div className="w-10 h-10 bg-pixel-panel-light border border-[#2A3444] flex items-center justify-center font-pixel text-[9px]">{entry.nama[0]}</div>
              <div className="flex-1">
                <p className="font-vt text-lg text-pixel-cream">{entry.nama}</p>
                <p className="font-pixel text-[6px] text-pixel-cream/30">STREAK {Math.floor(Math.random()*7)+1} HARI</p>
              </div>
              <span className="font-pixel text-[8px] px-3 py-1 bg-pixel-amber/15 text-pixel-amber border border-pixel-amber/20">{entry.totalXp} XP</span>
            </div>
          ))}
        </div>
      </div>
    )}</div>
}

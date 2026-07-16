import React, { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { badgeService } from '../../services/badge.service'
import { progressService } from '../../services/progress.service'
import { Badge } from '../../types/badge.types'
import { mockBadges } from '../../services/mockData'
import { Flame, Award, Lock } from 'lucide-react'
export const ProfilePage: React.FC = () => {
  const { user } = useAuth(); const [badges, setBadges] = useState<Badge[]>([]); const [activeTab, setActiveTab] = useState<'badges'|'history'>('badges'); const [history, setHistory] = useState<any[]>([])
  useEffect(()=>{ badgeService.getUserBadges().then(res=>{ const data=res.data.data; if(Array.isArray(data)) setBadges(data); else setBadges(mockBadges) }).catch(()=>setBadges(mockBadges)); progressService.getProgress({}).then(res=>{ const data=res.data.data; if(data?.content) setHistory(data.content); else setHistory([{ id:1, levelNama:"Vocabulary Dasar", duniaNama:"Bahasa Inggris", skor:100, isLulus:true, xpDidapat:60, waktuSelesai:new Date().toISOString() },{ id:2, levelNama:"Pola & Urutan", duniaNama:"Logika", skor:88, isLulus:true, xpDidapat:50, waktuSelesai:new Date().toISOString() }]) }).catch(()=>{}) },[])
  return <div className="max-w-4xl mx-auto px-4 py-8">
    <div className="pixel-panel p-6 flex flex-col md:flex-row gap-6 items-start">
      <div className="w-20 h-20 flex items-center justify-center text-3xl font-pixel border-3 border-pixel-green bg-pixel-green/20 text-pixel-green">{user?.nama?.[0]?.toUpperCase()}</div>
      <div className="flex-1">
        <h1 className="font-pixel text-[14px] text-pixel-cream">{user?.nama}</h1>
        <p className="font-vt text-lg text-pixel-cream/50">{user?.email} &bull; {user?.role}</p>
        <div className="mt-3 flex gap-2 flex-wrap">
          <span className="font-pixel text-[7px] px-3 py-1 bg-pixel-amber/15 border border-pixel-amber/30 text-pixel-amber"><Flame size={12} className="inline-block mr-1" />{user?.totalXp||240} XP</span>
          <span className="font-pixel text-[7px] px-3 py-1 bg-pixel-coral/15 border border-pixel-coral/30 text-pixel-coral"><Flame size={12} className="inline-block mr-1" />{user?.currentStreak||3} STRIK</span>
          <span className="font-pixel text-[7px] px-3 py-1 bg-pixel-green/15 border border-pixel-green/30 text-pixel-green"><Award size={12} className="inline-block mr-1" />{badges.filter(b=>b.earned).length} BADGE</span>
        </div>
      </div>
    </div>
    <div className="mt-8 flex gap-2">
      <button onClick={()=>setActiveTab('badges')} className={`font-pixel text-[8px] px-5 py-2 border-2 transition ${activeTab==='badges' ? 'bg-pixel-amber text-pixel-navy border-pixel-amber' : 'bg-pixel-panel text-pixel-cream/50 border-[#2A3444] hover:border-pixel-cream/30'}`}>BADGE</button>
      <button onClick={()=>setActiveTab('history')} className={`font-pixel text-[8px] px-5 py-2 border-2 transition ${activeTab==='history' ? 'bg-pixel-amber text-pixel-navy border-pixel-amber' : 'bg-pixel-panel text-pixel-cream/50 border-[#2A3444] hover:border-pixel-cream/30'}`}>RIWAYAT</button>
    </div>
    {activeTab==='badges' ? (
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {badges.map(b => (
          <div key={b.id} className={`pixel-panel p-4 ${!b.earned ? 'opacity-40' : ''}`}>
            <div className="w-12 h-12 flex items-center justify-center text-white font-bold mb-3 border-2" style={{backgroundColor:b.warna, borderColor:b.warna}}>{b.earned ? <Award size={20} /> : <Lock size={20} />}</div>
            <h3 className="font-pixel text-[9px] text-pixel-cream">{b.nama}</h3>
            <p className="font-vt text-base text-pixel-cream/40 mt-1">{b.deskripsi}</p>
            {b.earned && <p className="font-pixel text-[6px] mt-2 px-2 py-0.5 bg-pixel-green/10 text-pixel-green border border-pixel-green/20 inline-block">EARNED {b.earnedAt ? new Date(b.earnedAt).toLocaleDateString() : 'BARU'}</p>}
            {!b.earned && b.syaratType && <p className="font-vt text-sm text-pixel-cream/30 mt-2">Syarat: {b.syaratType} {b.syaratValue}</p>}
          </div>
        ))}
      </div>
    ) : (
      <div className="mt-6 space-y-3">
        {history.map(h => (
          <div key={h.id} className="pixel-panel p-4 flex items-center gap-4">
            <div className={`w-10 h-10 flex items-center justify-center font-pixel text-[8px] text-pixel-navy border-2 ${h.isLulus?'bg-pixel-green border-pixel-green':'bg-pixel-coral border-pixel-coral'}`}>{h.isLulus?'✓':'✗'}</div>
            <div className="flex-1">
              <p className="font-pixel text-[9px] text-pixel-cream">{h.levelNama} <span className="text-pixel-cream/40 font-normal">&bull; {h.duniaNama}</span></p>
              <p className="font-vt text-sm text-pixel-cream/40">Skor {h.skor}% &bull; +{h.xpDidapat} XP &bull; {new Date(h.waktuSelesai).toLocaleDateString('id-ID')}</p>
            </div>
            <span className={`font-pixel text-[7px] px-2.5 py-1 border ${h.isLulus ? 'bg-pixel-green/15 text-pixel-green border-pixel-green/30' : 'bg-pixel-coral/15 text-pixel-coral border-pixel-coral/30'}`}>{h.isLulus?'LULUS':'GAGAL'}</span>
          </div>
        ))}
      </div>
    )}</div>
}

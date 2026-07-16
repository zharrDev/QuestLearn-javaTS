import React, { useState } from 'react'
import { RPGItem, SHOP_ITEMS } from '../../types/rpg.types'
import { Button } from '../common/Button'
import { Store, ShoppingCart, Package, Sparkles } from 'lucide-react'

interface Props {
  coins: number
  inventory: RPGItem[]
  onClose: () => void
  onBuy: (item: RPGItem) => boolean
  theme: 'english' | 'math' | 'logic' | 'hub'
}

export const ShopModal: React.FC<Props> = ({ coins, inventory, onClose, onBuy, theme }) => {
  const [tab, setTab] = useState<'buy' | 'inventory'>('buy')
  const [message, setMessage] = useState<string | null>(null)

  const handleBuy = (item: RPGItem) => {
    const success = onBuy(item)
    if (success) {
      setMessage(`BERHASIL BELI ${item.name} ${item.emoji}!`)
      setTimeout(() => setMessage(null), 2000)
    } else {
      setMessage(`COIN TIDAK CUKUP! Butuh ${item.price}`)
      setTimeout(() => setMessage(null), 2000)
    }
  }

  const getThemeColor = () => {
    if (theme === 'english') return '#B5533C'
    if (theme === 'math') return '#D9A24B'
    return '#6FCF6F'
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="pixel-panel p-0 w-full max-w-[560px] max-h-[80vh] overflow-hidden flex flex-col" style={{ borderColor: getThemeColor() }}>
        <div className="p-4 border-b-2 border-[#2A3444]" style={{ background: `${getThemeColor()}15` }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pixel-dark border-2 flex items-center justify-center text-xl" style={{ borderColor: getThemeColor() }}><Store size={20} /></div>
              <div>
                <h3 className="font-pixel text-[9px] text-pixel-cream">TOKO PETUALANG</h3>
                <p className="font-vt text-sm text-pixel-cream/40">Beli item pakai coin!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-pixel-dark border-2 border-pixel-amber px-3 py-1 font-pixel text-[8px] text-pixel-amber flex items-center gap-1"><Sparkles size={14} />{coins}</div>
              <button onClick={onClose} className="w-8 h-8 bg-pixel-dark border border-[#2A3444] flex items-center justify-center font-pixel text-[8px] text-pixel-cream/50">✕</button>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setTab('buy')} className={`font-pixel text-[7px] px-4 py-1.5 border-2 transition ${tab === 'buy' ? 'bg-pixel-amber text-pixel-navy border-pixel-amber' : 'bg-pixel-dark text-pixel-cream/50 border-[#2A3444]'}`}><ShoppingCart size={14} className="inline-block mr-1" />BELI</button>
            <button onClick={() => setTab('inventory')} className={`font-pixel text-[7px] px-4 py-1.5 border-2 transition ${tab === 'inventory' ? 'bg-pixel-amber text-pixel-navy border-pixel-amber' : 'bg-pixel-dark text-pixel-cream/50 border-[#2A3444]'}`}><Package size={14} className="inline-block mr-1" />INV ({inventory.reduce((a, b) => a + (b.owned || 0), 0)})</button>
          </div>
        </div>

        {message && (
          <div className="mx-4 mt-3 pixel-panel-light p-2 text-center">
            <span className="font-pixel text-[8px] text-pixel-amber">{message}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'buy' ? (
            <div className="grid md:grid-cols-2 gap-3">
              {SHOP_ITEMS.map(item => {
                const owned = inventory.find(i => i.id === item.id)?.owned || 0
                return (
                  <div key={item.id} className="pixel-panel-light p-3 flex flex-col">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-pixel-dark border-2 border-[#2A3444] flex items-center justify-center text-2xl">{item.emoji}</div>
                      <div className="flex-1">
                        <h4 className="font-pixel text-[8px] text-pixel-cream">{item.name}</h4>
                        <p className="font-vt text-sm text-pixel-cream/40">{item.description}</p>
                        <p className="font-pixel text-[6px] text-pixel-cream/30 mt-1">Punya: {owned}x &bull; {item.type}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-pixel text-[8px] text-pixel-amber flex items-center gap-1"><Sparkles size={14} />{item.price}</span>
                      <Button size="sm" disabled={coins < item.price} onClick={() => handleBuy(item)}>{coins >= item.price ? 'BELI' : 'KURANG'}</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div>
              {inventory.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-2"><Package size={48} className="inline-block text-pixel-cream/50" /></div>
                  <p className="font-pixel text-[9px] text-pixel-cream">INVENTORY KOSONG</p>
                  <p className="font-vt text-base text-pixel-cream/30 mt-1">Beli item di toko!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {inventory.map(item => (
                    <div key={item.id} className="pixel-panel-light p-3 flex gap-3">
                      <div className="w-12 h-12 bg-pixel-dark border border-[#2A3444] flex items-center justify-center text-2xl">{item.emoji}</div>
                      <div>
                        <h4 className="font-pixel text-[8px] text-pixel-cream">{item.name} x{item.owned}</h4>
                        <p className="font-vt text-sm text-pixel-cream/40">{item.description}</p>
                        <p className="font-pixel text-[6px] text-pixel-green mt-1">Efek: {item.effect}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-3 border-t-2 border-[#2A3444] bg-pixel-dark flex justify-between items-center">
          <p className="font-vt text-sm text-pixel-cream/30"><Sparkles size={14} className="inline-block mr-1" />Coin dari musuh & level</p>
          <Button variant="ghost" size="sm" onClick={onClose}>TUTUP</Button>
        </div>
      </div>
    </div>
  )
}

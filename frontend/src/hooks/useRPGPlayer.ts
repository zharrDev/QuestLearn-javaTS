import { useState, useEffect, useCallback } from 'react'
import { PlayerData, RPGItem, SHOP_ITEMS } from '../types/rpg.types'

const PLAYER_KEY = 'rpg_player'
const COINS_KEY = 'rpg_coins'
const INVENTORY_KEY = 'rpg_inventory'

export const useRPGPlayer = () => {
  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [coins, setCoins] = useState(60) // start with 60 like screenshot
  const [inventory, setInventory] = useState<RPGItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem(PLAYER_KEY)
    if (saved) {
      try { setPlayer(JSON.parse(saved)) } catch {}
    }
    const savedCoins = localStorage.getItem(COINS_KEY)
    if (savedCoins) setCoins(parseInt(savedCoins))
    else {
      // check rpg_xp for backward compat
      const xp = localStorage.getItem('rpg_xp')
      if (xp) setCoins(Math.floor(parseInt(xp)/2) + 60)
    }
    const savedInv = localStorage.getItem(INVENTORY_KEY)
    if (savedInv) {
      try { setInventory(JSON.parse(savedInv)) } catch {}
    }
  }, [])

  const savePlayer = useCallback((data: PlayerData) => {
    const withStats = { ...data, coins, inventory, hp: data.hp || 50, maxHp: data.maxHp || 50 }
    localStorage.setItem(PLAYER_KEY, JSON.stringify(withStats))
    setPlayer(withStats)
  }, [coins, inventory])

  const addCoins = useCallback((amount: number) => {
    setCoins(prev => {
      const next = prev + amount
      localStorage.setItem(COINS_KEY, next.toString())
      return next
    })
  }, [])

  const spendCoins = useCallback((amount: number): boolean => {
    if (coins < amount) return false
    setCoins(prev => {
      const next = prev - amount
      localStorage.setItem(COINS_KEY, next.toString())
      return next
    })
    return true
  }, [coins])

  const addItem = useCallback((item: RPGItem) => {
    setInventory(prev => {
      const existing = prev.find(i => i.id === item.id)
      let next: RPGItem[]
      if (existing) {
        next = prev.map(i => i.id === item.id ? { ...i, owned: (i.owned || 1) + 1 } : i)
      } else {
        next = [...prev, { ...item, owned: 1 }]
      }
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const removeItem = useCallback((itemId: string) => {
    setInventory(prev => {
      const next = prev.map(i => i.id === itemId ? { ...i, owned: Math.max(0, (i.owned || 1) - 1) } : i).filter(i => (i.owned || 0) > 0)
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const buyItem = useCallback((item: RPGItem): boolean => {
    if (coins < item.price) return false
    if (!spendCoins(item.price)) return false
    addItem(item)
    return true
  }, [coins, spendCoins, addItem])

  return {
    player,
    coins,
    inventory,
    savePlayer,
    addCoins,
    spendCoins,
    addItem,
    removeItem,
    buyItem,
    refresh: () => {
      const saved = localStorage.getItem(PLAYER_KEY)
      if (saved) try { setPlayer(JSON.parse(saved)) } catch {}
      const c = localStorage.getItem(COINS_KEY)
      if (c) setCoins(parseInt(c))
      const inv = localStorage.getItem(INVENTORY_KEY)
      if (inv) try { setInventory(JSON.parse(inv)) } catch {}
    }
  }
}

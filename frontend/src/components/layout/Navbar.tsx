import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../common/Button'
import { Zap, Flame } from 'lucide-react'

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="sticky top-0 z-40 bg-pixel-dark border-b-3 border-hud-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[52px] items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pixel-amber border-2 border-[#B8842A] shadow-pixel-sm flex items-center justify-center">
              <span className="font-pixel text-[10px] text-pixel-navy">Q</span>
            </div>
            <span className="font-pixel text-[11px] text-pixel-cream hidden sm:block">
              QuestLearn
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-2 mr-1">
                  <div className="hud-item hud-xp text-[8px]">
                    <Zap size={10} />
                    <span>{user?.totalXp || 0}</span>
                  </div>
                  <div className="hud-item hud-lives text-[8px]">
                    <Flame size={10} />
                    <span>{user?.currentStreak || 0}</span>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  className="px-3 py-1.5 font-pixel text-[8px] text-pixel-cream/70 hover:text-pixel-cream hover:bg-pixel-panel-light transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/typing"
                  className="px-3 py-1.5 font-pixel text-[8px] text-green-400 hover:bg-green-400/10 transition"
                >
                  ⚔️ Typing
                </Link>
                <Link
                  to="/leaderboard"
                  className="px-3 py-1.5 font-pixel text-[8px] text-pixel-cream/70 hover:text-pixel-cream hover:bg-pixel-panel-light transition"
                >
                  Rank
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-3 py-1.5 font-pixel text-[8px] bg-pixel-green/20 text-pixel-green border border-pixel-green/30 hover:bg-pixel-green/30 transition"
                  >
                    Admin
                  </Link>
                )}

                <div className="w-px h-5 bg-pixel-cream/15 mx-1" />

                <Link
                  to="/profile"
                  className="w-7 h-7 bg-pixel-green border-2 border-[#4A9C4A] shadow-pixel-sm flex items-center justify-center font-pixel text-[7px] text-pixel-navy hover:bg-pixel-green/80 transition"
                >
                  {user?.nama?.[0]?.toUpperCase()}
                </Link>

                <button
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                  className="px-2.5 py-1 font-pixel text-[7px] text-pixel-coral/70 hover:text-pixel-coral transition"
                >
                  EXIT
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 font-pixel text-[8px] text-pixel-cream/70 hover:text-pixel-cream transition"
                >
                  MASUK
                </Link>
                <Link to="/register">
                  <Button size="sm">DAFTAR</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

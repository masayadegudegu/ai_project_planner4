import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { ChevronDownIcon, FolderIcon, KeyIcon } from './icons'

interface UserMenuProps {
  onOpenProjectLibrary: () => void
  onClearApiKey: () => void
}

const UserMenu: React.FC<UserMenuProps> = ({ onOpenProjectLibrary, onClearApiKey }) => {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  if (!user) return null

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'ユーザー'
  const avatarUrl = user.user_metadata?.avatar_url

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="w-6 h-6 rounded-full" />
        ) : (
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden sm:block">{displayName}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-slate-600 border-b border-slate-200">
              {user.email}
            </div>
            <button
              onClick={() => {
                onOpenProjectLibrary()
                setIsOpen(false)
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <FolderIcon className="w-4 h-4 mr-2" />
              プロジェクトライブラリ
            </button>
            <button
              onClick={() => {
                onClearApiKey()
                setIsOpen(false)
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <KeyIcon className="w-4 h-4 mr-2" />
              APIキーを変更
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 border-t border-slate-200"
            >
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu
import React, { useState } from 'react'
import { XIcon, KeyIcon, SparklesIcon } from './icons'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'signin' | 'signup'
  onModeChange: (mode: 'signin' | 'signup') => void
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onModeChange }) => {
  const { signIn, signUp, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
        onClose()
      } else {
        if (!displayName.trim()) {
          throw new Error('表示名を入力してください')
        }
        const { error } = await signUp(email, password, displayName)
        if (error) throw error
        setError(null)
        // Show success message for signup
        alert('確認メールを送信しました。メールを確認してアカウントを有効化してください。')
        onClose()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '認証に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await resetPassword(email)
      if (error) throw error
      setResetEmailSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'パスワードリセットに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setDisplayName('')
    setError(null)
    setShowResetPassword(false)
    setResetEmailSent(false)
  }

  const handleModeChange = (newMode: 'signin' | 'signup') => {
    resetForm()
    onModeChange(newMode)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (showResetPassword) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
        <div className="w-full max-w-md bg-white shadow-2xl rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">パスワードリセット</h2>
            <button onClick={handleClose} className="p-1 rounded-full hover:bg-slate-100">
              <XIcon className="w-6 h-6 text-slate-500" />
            </button>
          </div>

          {resetEmailSent ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-100 border border-green-400 rounded-md">
                <p className="text-green-800">パスワードリセット用のメールを送信しました。</p>
              </div>
              <button
                onClick={() => setShowResetPassword(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg"
              >
                ログイン画面に戻る
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700 mb-1">
                  メールアドレス
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-100 border border-red-400 rounded-md">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'リセットメールを送信'}
              </button>

              <button
                type="button"
                onClick={() => setShowResetPassword(false)}
                className="w-full text-blue-600 hover:text-blue-800 text-sm"
              >
                ログイン画面に戻る
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <SparklesIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-slate-800">
              {mode === 'signin' ? 'ログイン' : 'アカウント作成'}
            </h2>
          </div>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-slate-100">
            <XIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-1">
                表示名
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="山田太郎"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="6文字以上"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center"
          >
            {loading ? <LoadingSpinner size="sm" /> : (mode === 'signin' ? 'ログイン' : 'アカウント作成')}
          </button>
        </form>

        <div className="mt-6 text-center">
          {mode === 'signin' ? (
            <>
              <button
                onClick={() => setShowResetPassword(true)}
                className="text-blue-600 hover:text-blue-800 text-sm mb-2 block w-full"
              >
                パスワードを忘れた場合
              </button>
              <p className="text-slate-600 text-sm">
                アカウントをお持ちでない方は{' '}
                <button
                  onClick={() => handleModeChange('signup')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  こちら
                </button>
              </p>
            </>
          ) : (
            <p className="text-slate-600 text-sm">
              既にアカウントをお持ちの方は{' '}
              <button
                onClick={() => handleModeChange('signin')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                こちら
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthModal
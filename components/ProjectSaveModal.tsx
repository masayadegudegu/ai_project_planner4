import React, { useState } from 'react'
import { XIcon, DownloadIcon } from './icons'
import { useProjects } from '../hooks/useProjects'
import { ProjectTask, GanttItem } from '../types'
import LoadingSpinner from './LoadingSpinner'

interface ProjectSaveModalProps {
  isOpen: boolean
  onClose: () => void
  projectGoal: string
  targetDate: string
  tasks: ProjectTask[]
  ganttData: GanttItem[] | null
  currentProjectId?: string
  onSaved?: (projectId: string) => void
}

const ProjectSaveModal: React.FC<ProjectSaveModalProps> = ({
  isOpen,
  onClose,
  projectGoal,
  targetDate,
  tasks,
  ganttData,
  currentProjectId,
  onSaved
}) => {
  const { saveProject } = useProjects()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const result = await saveProject(projectGoal, targetDate, tasks, ganttData, currentProjectId)
      onSaved?.(result.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleExportLocal = () => {
    const content = {
      projectGoal,
      targetDate,
      tasks,
      ganttData
    }
    
    const jsonString = JSON.stringify(content, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectGoal.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '_')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <header className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">プロジェクトを保存</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
            <XIcon className="w-6 h-6 text-slate-500" />
          </button>
        </header>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-medium text-slate-800 mb-2">プロジェクト情報</h3>
            <div className="bg-slate-50 p-3 rounded-md text-sm">
              <p className="font-medium text-slate-700 mb-1">目的:</p>
              <p className="text-slate-600 mb-2">{projectGoal}</p>
              <p className="font-medium text-slate-700 mb-1">目標日:</p>
              <p className="text-slate-600">{new Date(targetDate + 'T00:00:00Z').toLocaleDateString('ja-JP')}</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center"
            >
              {saving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  {currentProjectId ? '更新して保存' : 'クラウドに保存'}
                </>
              )}
            </button>

            <button
              onClick={handleExportLocal}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center"
            >
              <DownloadIcon className="w-5 h-5 mr-2" />
              ローカルファイルとしてエクスポート
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-4 text-center">
            クラウド保存により、どのデバイスからでもアクセス可能になります
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProjectSaveModal
import React, { useState, useRef } from 'react'
import { XIcon, DownloadIcon, TrashIcon, CalendarIcon, TargetIcon, UploadIcon, FolderIcon } from './icons'
import { useProjects, ProjectData } from '../hooks/useProjects'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from './LoadingSpinner'
import { ProjectFileContent } from '../types'

interface ProjectLibraryModalProps {
  isOpen: boolean
  onClose: () => void
  onLoadProject: (projectGoal: string, targetDate: string, tasks: any[], ganttData: any, projectId?: string) => void
  onImportProject: (file: File) => void
}

const ProjectLibraryModal: React.FC<ProjectLibraryModalProps> = ({
  isOpen,
  onClose,
  onLoadProject,
  onImportProject
}) => {
  const { user } = useAuth()
  const { projects, loading, deleteProject, loadProject } = useProjects()
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleLoadProject = async (projectId: string) => {
    try {
      const projectData = await loadProject(projectId)
      onLoadProject(
        projectData.projectGoal,
        projectData.targetDate,
        projectData.tasks,
        projectData.ganttData,
        projectData.projectId
      )
      onClose()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'プロジェクトの読み込みに失敗しました')
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (deleteConfirm !== projectId) {
      setDeleteConfirm(projectId)
      return
    }

    try {
      await deleteProject(projectId)
      setDeleteConfirm(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'プロジェクトの削除に失敗しました')
    }
  }

  const handleExportProject = (project: ProjectData) => {
    const content: ProjectFileContent = {
      projectGoal: project.goal,
      targetDate: project.target_date,
      tasks: project.tasks,
      ganttData: project.ganttData
    }
    
    const jsonString = JSON.stringify(content, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImportProject(file)
      onClose()
      event.target.value = '' // Reset file input
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00Z').toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center">
            <FolderIcon className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-slate-800">プロジェクトライブラリ</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleImportClick}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200"
            >
              <UploadIcon className="w-4 h-4" />
              ローカルファイルをインポート
            </button>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100">
              <XIcon className="w-6 h-6 text-slate-500" />
            </button>
          </div>
        </header>

        <div className="flex-grow p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="lg" text="プロジェクトを読み込み中..." />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">保存されたプロジェクトがありません</h3>
              <p className="text-slate-500">新しいプロジェクトを作成するか、ローカルファイルをインポートしてください。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                    selectedProject === project.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                  }`}
                  onClick={() => setSelectedProject(project.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-slate-800 truncate flex-grow mr-2">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExportProject(project)
                        }}
                        className="p-1 text-slate-500 hover:text-blue-600 rounded"
                        title="エクスポート"
                      >
                        <DownloadIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteProject(project.id)
                        }}
                        className={`p-1 rounded ${
                          deleteConfirm === project.id
                            ? 'text-red-700 bg-red-100'
                            : 'text-slate-500 hover:text-red-600'
                        }`}
                        title={deleteConfirm === project.id ? 'もう一度クリックで削除' : '削除'}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-start">
                      <TargetIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="line-clamp-2">{project.goal}</p>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{formatDate(project.target_date)}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <span>{project.tasks.length} タスク</span>
                    <span>更新: {new Date(project.updated_at).toLocaleDateString('ja-JP')}</span>
                  </div>

                  {selectedProject === project.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLoadProject(project.id)
                      }}
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm"
                    >
                      このプロジェクトを開く
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
      </div>
    </div>
  )
}

export default ProjectLibraryModal
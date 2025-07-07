import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ProjectTask, GanttItem } from '../types'
import { useAuth } from './useAuth'

export interface ProjectData {
  id: string
  title: string
  goal: string
  target_date: string
  tasks: ProjectTask[]
  ganttData: GanttItem[] | null
  created_at: string
  updated_at: string
  created_by: string
  collaborators: string[]
}

export const useProjects = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .or(`created_by.eq.${user.id},collaborators.cs.{${user.id}}`)
        .order('updated_at', { ascending: false })

      if (error) throw error

      const formattedProjects = data.map(project => ({
        ...project,
        tasks: project.data?.tasks || [],
        ganttData: project.data?.ganttData || null,
        collaborators: project.collaborators || []
      }))

      setProjects(formattedProjects)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プロジェクトの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const saveProject = async (
    projectGoal: string,
    targetDate: string,
    tasks: ProjectTask[],
    ganttData: GanttItem[] | null,
    projectId?: string
  ) => {
    if (!user) throw new Error('ログインが必要です')

    setError(null)

    try {
      const projectData = {
        title: projectGoal.substring(0, 100), // Limit title length
        goal: projectGoal,
        target_date: targetDate,
        data: { tasks, ganttData },
        updated_at: new Date().toISOString()
      }

      if (projectId) {
        // Update existing project
        const { data, error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', projectId)
          .eq('created_by', user.id) // Ensure user owns the project
          .select()
          .single()

        if (error) throw error
        
        // Update local state
        setProjects(prev => prev.map(p => 
          p.id === projectId 
            ? { ...p, ...projectData, tasks, ganttData }
            : p
        ))

        return data
      } else {
        // Create new project
        const { data, error } = await supabase
          .from('projects')
          .insert({
            ...projectData,
            created_by: user.id,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error

        // Add to local state
        const newProject = {
          ...data,
          tasks,
          ganttData,
          collaborators: []
        }
        setProjects(prev => [newProject, ...prev])

        return data
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'プロジェクトの保存に失敗しました'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deleteProject = async (projectId: string) => {
    if (!user) throw new Error('ログインが必要です')

    setError(null)

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('created_by', user.id) // Ensure user owns the project

      if (error) throw error

      // Remove from local state
      setProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'プロジェクトの削除に失敗しました'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const loadProject = async (projectId: string) => {
    if (!user) throw new Error('ログインが必要です')

    setError(null)

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .or(`created_by.eq.${user.id},collaborators.cs.{${user.id}}`)
        .single()

      if (error) throw error

      return {
        projectGoal: data.goal,
        targetDate: data.target_date,
        tasks: data.data?.tasks || [],
        ganttData: data.data?.ganttData || null,
        projectId: data.id
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'プロジェクトの読み込みに失敗しました'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    if (user) {
      fetchProjects()
    } else {
      setProjects([])
    }
  }, [user])

  return {
    projects,
    loading,
    error,
    saveProject,
    deleteProject,
    loadProject,
    refetch: fetchProjects
  }
}
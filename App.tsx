import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useProjects } from './hooks/useProjects';
import { AuthModal } from './components/AuthModal';
import { UserMenu } from './components/UserMenu';
import { ProjectInputForm } from './components/ProjectInputForm';
import { ProjectFlowDisplay } from './components/ProjectFlowDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { ProjectLibraryModal } from './components/ProjectLibraryModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { supabase } from './lib/supabase';
import type { Project } from './types';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { projects, loading: projectsLoading, error, refetch } = useProjects();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProjectLibrary, setShowProjectLibrary] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true);
    }
  }, [user, authLoading]);

  const handleProjectCreated = (project: Project) => {
    setCurrentProject(project);
    setIsCreatingProject(false);
    refetch();
  };

  const handleProjectSelected = (project: Project) => {
    setCurrentProject(project);
    setShowProjectLibrary(false);
  };

  const handleNewProject = () => {
    setCurrentProject(null);
    setIsCreatingProject(true);
    setShowProjectLibrary(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Project Planner</h1>
            <p className="text-gray-600 mb-8">Plan and manage your projects with AI assistance</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">AI Project Planner</h1>
              <button
                onClick={() => setShowProjectLibrary(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                My Projects
              </button>
              <button
                onClick={handleNewProject}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Project
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowApiKeyModal(true)}
                className="text-gray-600 hover:text-gray-700"
              >
                API Settings
              </button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {currentProject ? (
          <ProjectFlowDisplay
            project={currentProject}
            onProjectUpdate={(updatedProject) => {
              setCurrentProject(updatedProject);
              refetch();
            }}
          />
        ) : isCreatingProject ? (
          <ProjectInputForm
            onProjectCreated={handleProjectCreated}
            onCancel={() => setIsCreatingProject(false)}
          />
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to AI Project Planner</h2>
              <p className="text-gray-600 mb-8">
                Create a new project or select an existing one from your library to get started.
              </p>
              <div className="space-y-4">
                <button
                  onClick={handleNewProject}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create New Project
                </button>
                <button
                  onClick={() => setShowProjectLibrary(true)}
                  className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Browse My Projects
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <ProjectLibraryModal
        isOpen={showProjectLibrary}
        onClose={() => setShowProjectLibrary(false)}
        onProjectSelect={handleProjectSelected}
        onNewProject={handleNewProject}
        projects={projects}
        loading={projectsLoading}
      />

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
      />
    </div>
  );
}

export default App;
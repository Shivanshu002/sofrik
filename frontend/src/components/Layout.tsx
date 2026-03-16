import React from 'react';
import Sidebar from './Sidebar';
import AiPanel from './AiPanel';
import { Project, Task } from '../types';

interface Props {
  children: React.ReactNode;
  search?: string;
  setSearch?: (v: string) => void;
  status?: string;
  setStatus?: (v: string) => void;
  onNewProject?: () => void;
  selectedProject?: Project | null;
  selectedTask?: Task | null;
  sidebarOpen?: boolean;
  setSidebarOpen?: (v: boolean) => void;
}

const Layout: React.FC<Props> = ({
  children,
  search = '',
  setSearch = () => {},
  status = '',
  setStatus = () => {},
  onNewProject = () => {},
  selectedProject,
  selectedTask,
  sidebarOpen = false,
  setSidebarOpen = () => {},
}) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-30 w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-white
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          onNewProject={onNewProject}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {children}
      </main>

      {/* Right AI Panel - hidden on small screens, visible md+ */}
      <div className="hidden lg:flex w-80 shrink-0 border-l border-gray-200 bg-gray-50 p-3 flex-col">
        <AiPanel selectedProject={selectedProject} selectedTask={selectedTask} />
      </div>

      {/* Mobile AI floating button - shows when item selected */}
      {(selectedProject || selectedTask) && (
        <div className="lg:hidden fixed bottom-4 right-4 z-10">
          <details className="relative">
            <summary className="bg-indigo-600 text-white px-4 py-3 rounded-full shadow-lg cursor-pointer list-none flex items-center gap-2 text-sm font-medium">
              🤖 AI Suggestions
            </summary>
            <div className="absolute bottom-14 right-0 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-200">
              <AiPanel selectedProject={selectedProject} selectedTask={selectedTask} />
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default Layout;

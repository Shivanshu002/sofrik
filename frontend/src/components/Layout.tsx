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
}) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <Sidebar
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        onNewProject={onNewProject}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {children}
      </main>

      {/* Right AI Panel */}
      <div className="w-80 shrink-0 p-4 border-l border-gray-200 bg-gray-50 flex flex-col" style={{ minHeight: '100vh' }}>
        <AiPanel selectedProject={selectedProject} selectedTask={selectedTask} />
      </div>
    </div>
  );
};

export default Layout;

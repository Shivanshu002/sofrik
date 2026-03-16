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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Left Sidebar - fixed */}
      <div className="w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
        <Sidebar
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          onNewProject={onNewProject}
        />
      </div>

      {/* Main Content - scrollable */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {children}
      </main>

      {/* Right AI Panel - fixed */}
      <div className="w-80 shrink-0 border-l border-gray-200 bg-gray-50 p-3 overflow-hidden flex flex-col">
        <AiPanel selectedProject={selectedProject} selectedTask={selectedTask} />
      </div>
    </div>
  );
};

export default Layout;

export const Routes = {
  url: {
    auth: {
      login: 'auth/login',
      register: 'auth/register',
    },
    projects: {
      base: 'projects',
      byId: (id: string) => `projects/${id}`,
    },
    tasks: {
      base: 'tasks',
      byId: (id: string) => `tasks/${id}`,
      byProject: (projectId: string) => `tasks/project/${projectId}`,
    },
    ai: {
      suggest: 'ai/suggest',
      chat: 'ai/chat',
    },
  },
};

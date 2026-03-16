import { doPost } from '../../services';
import { Routes } from '../../utils/routes';

export const getSuggestions = async (data: {
  title: string;
  description?: string;
  type: 'project' | 'task';
  status?: string;
  dueDate?: string;
}): Promise<{ suggestions: string[] }> => {
  const res = await doPost(Routes.url.ai.suggest, data);
  return res.data;
};

export const sendChatMessage = async (data: {
  message: string;
  context?: string;
}): Promise<{ reply: string }> => {
  const res = await doPost(Routes.url.ai.chat, data);
  return res.data;
};

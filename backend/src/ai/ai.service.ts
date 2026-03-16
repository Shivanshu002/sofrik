import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AiSuggestDto, AiChatDto } from './ai.dto';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async getSuggestion(dto: AiSuggestDto): Promise<{ suggestions: string[] }> {
    const dueDateInfo = dto.dueDate
      ? `Due date: ${new Date(dto.dueDate).toDateString()}.`
      : '';

    const prompt = `You are a project management assistant. A user has a ${dto.type} with the following details:
Title: "${dto.title}"
Description: "${dto.description || 'No description provided'}"
Status: "${dto.status || 'unknown'}"
${dueDateInfo}

Provide exactly 5 concise, actionable suggestions to help the user complete or improve this ${dto.type}. 
Format your response as a JSON array of strings like: ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"]
Only return the JSON array, nothing else.`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        return { suggestions };
      }
      return { suggestions: [text] };
    } catch {
      return {
        suggestions: [
          `Break "${dto.title}" into smaller subtasks`,
          'Set clear milestones and deadlines',
          'Identify blockers early and address them',
          'Communicate progress with your team regularly',
          'Review and adjust your plan as needed',
        ],
      };
    }
  }

  async chat(dto: AiChatDto): Promise<{ reply: string }> {
    const systemContext = `You are a helpful project management assistant. Help users plan, organize, and complete their projects and tasks efficiently. Be concise and practical.`;

    const contextInfo = dto.context
      ? `\nCurrent context: ${dto.context}`
      : '';

    const prompt = `${systemContext}${contextInfo}\n\nUser: ${dto.message}\n\nAssistant:`;

    try {
      const result = await this.model.generateContent(prompt);
      const reply = result.response.text().trim();
      return { reply };
    } catch {
      return { reply: 'I am unable to respond right now. Please try again later.' };
    }
  }
}

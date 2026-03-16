import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AiSuggestDto, AiChatDto } from './ai.dto';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async getSuggestion(dto: AiSuggestDto): Promise<{ suggestions: string[] }> {
    const dueDateInfo = dto.dueDate
      ? `Due date: ${new Date(dto.dueDate).toDateString()}.`
      : '';

    const prompt = `You are a project management assistant. A user has a ${dto.type}:
Title: "${dto.title}"
Description: "${dto.description || 'No description'}"
Status: "${dto.status || 'unknown'}"
${dueDateInfo}

Give exactly 5 short, actionable suggestions to help complete this ${dto.type}.
Respond ONLY with a JSON array: ["tip1","tip2","tip3","tip4","tip5"]`;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text().trim();
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return { suggestions: JSON.parse(jsonMatch[0]) };
      }
      return { suggestions: [text] };
    } catch (err: any) {
      console.error('Gemini suggest error:', err?.message);
      throw new HttpException(
        err?.message || 'AI service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async chat(dto: AiChatDto): Promise<{ reply: string }> {
    const contextInfo = dto.context ? `\nContext: ${dto.context}` : '';
    const prompt = `You are a helpful project management assistant. Be concise and practical.${contextInfo}\n\nUser: ${dto.message}\n\nAssistant:`;

    try {
      const result = await this.model.generateContent(prompt);
      return { reply: result.response.text().trim() };
    } catch (err: any) {
      console.error('Gemini chat error:', err?.message);
      throw new HttpException(
        err?.message || 'AI service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}

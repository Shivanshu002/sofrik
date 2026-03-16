import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiSuggestDto, AiChatDto } from './ai.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('suggest')
  suggest(@Body() dto: AiSuggestDto) {
    return this.aiService.getSuggestion(dto);
  }

  @Post('chat')
  chat(@Body() dto: AiChatDto) {
    return this.aiService.chat(dto);
  }
}

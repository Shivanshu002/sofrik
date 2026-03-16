import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class AiSuggestDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description?: string;

  @IsNotEmpty()
  @IsEnum(['project', 'task'])
  type: 'project' | 'task';

  @IsOptional()
  status?: string;

  @IsOptional()
  dueDate?: string;
}

export class AiChatDto {
  @IsNotEmpty()
  message: string;

  @IsOptional()
  context?: string;
}

import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateProjectDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(['active', 'completed'])
  status?: string;
}

export class UpdateProjectDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(['active', 'completed'])
  status?: string;
}

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateReportDto {
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  activity?: string;
}

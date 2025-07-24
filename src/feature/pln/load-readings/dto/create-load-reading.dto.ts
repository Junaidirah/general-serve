import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateLoadReadingDto {
  @IsString()
  @IsNotEmpty()
  machineId: string;

  @IsDateString()
  timestamp: string;

  @IsNumber()
  load: number;

  @IsString()
  @IsOptional()
  status?: string;
}

export class BulkCreateLoadReadingDto {
  @IsString()
  @IsNotEmpty()
  machineId: string;

  readings: {
    timestamp: string;
    load: number;
    status?: string;
  }[];
}

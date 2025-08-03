import {
  IsNotEmpty,
  IsNumber,
  IsDate, // Changed from IsDateString
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateLoadReadingDto {
  @ApiProperty({
    description: 'Timestamp of the reading',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  timestamp: Date;

  @ApiProperty({
    description: 'Load value',
    example: 150.5,
  })
  @IsNotEmpty()
  @IsNumber()
  load: number;

  @ApiProperty({
    description: 'Average load value',
    example: 145.2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  avgLoad?: number;

  @ApiProperty({
    description: 'Maximum load value',
    example: 180.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  maxLoad?: number;

  @ApiProperty({
    description: 'Minimum load value',
    example: 120.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  minLoad?: number;

  @ApiProperty({
    description: 'DM Siang (Day Time Demand)',
    example: 100.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  dmSiang?: number;

  @ApiProperty({
    description: 'DM Malam (Night Time Demand)',
    example: 80.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  dmMalam?: number;

  @ApiProperty({
    description: 'Status of the reading',
    example: 'ACTIVE',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;
}

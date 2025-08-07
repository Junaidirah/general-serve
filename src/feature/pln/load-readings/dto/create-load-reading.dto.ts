import {
  IsNotEmpty,
  IsNumber,
  IsDate, // <-- UBAH IsDateString menjadi IsDate
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
  @IsDate() // <-- UBAH DI SINI
  @Type(() => Date)
  timestamp: Date;

  @ApiProperty({
    description: 'Load value',
    example: 150.5,
  })
  @IsNotEmpty()
  @IsNumber()
  load: number;

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

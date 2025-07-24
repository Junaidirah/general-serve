import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { PlantType } from '@prisma/client';

export class CreatePlantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(PlantType, {
    message:
      'type must be one of: PLTD_KOTARAYA, PLTM_TOMINI, THAS_POWER_PALASA, GSS_BOLANO, PLN_MOUTONG, THAS_POWER_MOUTONG',
  })
  type: PlantType;
}

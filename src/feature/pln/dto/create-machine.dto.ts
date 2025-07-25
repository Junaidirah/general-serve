import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateMachineDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsNotEmpty()
  @Matches(/^c[a-z0-9]{24}$/) // regex-nya CUID (panjang 25, mulai dengan 'c')
  plantId: string;
}

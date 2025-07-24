import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateMachineDto {
  /**
   * Pengenal unik untuk mesin, misalnya "Mesin 1", "Unit 3 (3412)", dll.
   * @example "Mesin 1"
   * @description Ini adalah identifier yang digunakan untuk membedakan mesin dalam sistem.
   */
  @IsString()
  @IsNotEmpty()
  identifier: string;

  /**
   * ID dari Plant (pembangkit) tempat mesin ini berada.
   * Harus berupa UUID yang valid.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @IsUUID()
  @IsNotEmpty()
  plantId: string;
}

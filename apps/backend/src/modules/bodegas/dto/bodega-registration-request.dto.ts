import { Transform, type TransformFnParams } from 'class-transformer';
import { Equals, IsBoolean, IsEmail, IsOptional, IsString, Length } from 'class-validator';

function trimString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function normalizeEmail({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

/** Contrato normativo: components/schemas/BodegaRegistrationRequest. */
export class BodegaRegistrationRequestDto {
  @Transform(trimString)
  @IsString()
  @Length(1, 160)
  nombre_comercial!: string;

  @Transform(trimString)
  @IsString()
  @Length(1, 200)
  razon_social!: string;

  @Transform(trimString)
  @IsString()
  @Length(1, 32)
  cif_vat!: string;

  @Transform(normalizeEmail)
  @IsEmail()
  @Length(3, 254)
  email!: string;

  @IsString()
  @Length(12, 128)
  password!: string;

  @Transform(trimString)
  @IsString()
  @Length(1, 100)
  persona_contacto!: string;

  @Transform(trimString)
  @IsString()
  @Length(1, 32)
  telefono!: string;

  @IsBoolean()
  @Equals(true)
  aceptacion_condiciones!: true;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @Length(1, 100)
  pais_contacto?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @Length(1, 100)
  ciudad?: string;

  @IsOptional()
  @Transform(trimString)
  @IsString()
  @Length(1, 20)
  codigo_postal?: string;
}

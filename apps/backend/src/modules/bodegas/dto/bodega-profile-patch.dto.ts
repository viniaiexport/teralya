import { Transform, type TransformFnParams } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, IsUrl, Length, Max, Min } from 'class-validator';

function trimString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function normalizeEmail({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

/** Contrato normativo: components/schemas/BodegaProfilePatch. */
export class BodegaProfilePatchDto {
  @IsOptional() @Transform(trimString) @IsString() @Length(1, 160)
  nombre_comercial?: string;

  @IsOptional() @Transform(trimString) @IsString() @Length(1, 5000)
  historia?: string;

  @IsOptional() @Transform(trimString) @IsString() @Length(1, 5000)
  filosofia?: string;

  @IsOptional() @Transform(trimString) @IsString() @Length(1, 160)
  region?: string;

  @IsOptional() @Transform(trimString) @IsString() @Length(1, 100)
  pais?: string;

  @IsOptional() @Transform(trimString) @IsString() @Length(1, 160)
  denominacion_origen?: string;

  @IsOptional() @IsInt() @Min(1800) @Max(2100)
  anio_fundacion?: number;

  @IsOptional() @Transform(trimString) @IsUrl({ require_protocol: true }) @Length(1, 2048)
  web?: string;

  @IsOptional() @Transform(trimString) @IsUrl({ require_protocol: true }) @Length(1, 2048)
  video_url?: string;

  @IsOptional() @Transform(normalizeEmail) @IsEmail() @Length(3, 254)
  email_principal?: string;

  @IsOptional() @Transform(trimString) @IsString() @Length(1, 32)
  telefono?: string;

  @IsOptional() @Transform(trimString) @IsString() @Length(1, 100)
  persona_contacto?: string;

  @IsOptional() @Transform(trimString) @IsUrl({ require_protocol: true }) @Length(1, 2048)
  logo_url?: string;

  @IsOptional() @Transform(trimString) @IsUrl({ require_protocol: true }) @Length(1, 2048)
  imagen_principal_url?: string;
}

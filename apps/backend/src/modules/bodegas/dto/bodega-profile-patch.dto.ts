import { Transform, type TransformFnParams } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';

function trimString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function normalizeEmail({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

function normalizeCountries({ value }: TransformFnParams): unknown {
  if (!Array.isArray(value)) return value;
  return [...new Set(value.map((item) => String(item).trim().toUpperCase()).filter(Boolean))];
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

  @IsOptional() @Transform(normalizeCountries) @IsArray() @ArrayMaxSize(27)
  @Matches(/^[A-Z]{2}$/, { each: true })
  paises_envio?: string[];

  @IsOptional() @IsInt() @Min(0) @Max(365)
  plazo_preparacion_dias?: number;

  @IsOptional() @Transform(trimString) @IsString() @Length(1, 1000)
  plazo_entrega_estimado?: string;

  @IsOptional() @Transform(trimString) @IsString() @Length(1, 2000)
  coste_envio_descripcion?: string;

  @IsOptional() @Transform(trimString) @IsString() @Length(1, 160)
  transportista_habitual?: string;

  @IsOptional() @Transform(trimString) @IsString() @Length(1, 2000)
  restricciones_entrega?: string;

  @IsOptional() @Transform(trimString) @IsString() @Length(1, 2000)
  condiciones_empaquetado?: string;

  @IsOptional() @IsBoolean()
  capacidad_internacional?: boolean;
}

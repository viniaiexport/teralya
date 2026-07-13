import { Transform, type TransformFnParams } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

const IDIOMAS_SOPORTADOS = ['es', 'en', 'fr', 'de', 'it'] as const;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type IdiomaSoportado = (typeof IDIOMAS_SOPORTADOS)[number];

function trimString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function normalizeEmail({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

function normalizeLanguage({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

/** Contrato normativo: components/schemas/RegisterBuyerRequest (teralya-openapi-v1.0.yaml). */
export class RegisterBuyerRequestDto {
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
  nombre!: string;

  @Transform(trimString)
  @IsString()
  @Length(1, 100)
  apellidos!: string;

  @Transform(trimString)
  @Matches(DATE_ONLY_PATTERN)
  @IsDateString({ strict: true, strictSeparator: true })
  fecha_nacimiento!: string;

  @IsBoolean()
  @Equals(true)
  declaracion_mayoria_edad!: true;

  @IsBoolean()
  @Equals(true)
  aceptacion_condiciones_alcohol!: true;

  @IsOptional()
  @Transform(normalizeLanguage)
  @IsIn(IDIOMAS_SOPORTADOS)
  idioma?: IdiomaSoportado;
}

import { Equals, IsBoolean, IsDateString, IsEmail, IsIn, IsOptional, IsString, Length } from 'class-validator';

const IDIOMAS_SOPORTADOS = ['es', 'en', 'fr', 'de', 'it'] as const;

export type IdiomaSoportado = (typeof IDIOMAS_SOPORTADOS)[number];

/** Contrato normativo: components/schemas/RegisterBuyerRequest (teralya-openapi-v1.0.yaml). */
export class RegisterBuyerRequestDto {
  @IsEmail()
  @Length(3, 254)
  email!: string;

  @IsString()
  @Length(12, 128)
  password!: string;

  @IsString()
  @Length(1, 100)
  nombre!: string;

  @IsString()
  @Length(1, 100)
  apellidos!: string;

  @IsDateString()
  fecha_nacimiento!: string;

  @IsBoolean()
  @Equals(true)
  declaracion_mayoria_edad!: true;

  @IsBoolean()
  @Equals(true)
  aceptacion_condiciones_alcohol!: true;

  @IsOptional()
  @IsIn(IDIOMAS_SOPORTADOS)
  idioma?: IdiomaSoportado;
}

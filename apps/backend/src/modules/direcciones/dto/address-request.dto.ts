import { Transform, type TransformFnParams } from 'class-transformer';
import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, Length } from 'class-validator';

export const ADDRESS_USES = ['envio', 'facturacion', 'ambos'] as const;
export type AddressUse = (typeof ADDRESS_USES)[number];
const trim = ({ value }: TransformFnParams): unknown => typeof value === 'string' ? value.trim() : value;
const email = ({ value }: TransformFnParams): unknown => typeof value === 'string' ? value.trim().toLowerCase() : value;

export class AddressCreateRequestDto {
  @IsIn(ADDRESS_USES) uso!: AddressUse;
  @Transform(trim) @IsString() @Length(1, 160) nombre_destinatario!: string;
  @Transform(trim) @IsString() @Length(1, 200) direccion!: string;
  @Transform(trim) @IsString() @Length(1, 20) codigo_postal!: string;
  @Transform(trim) @IsString() @Length(1, 100) ciudad!: string;
  @Transform(trim) @IsString() @Length(1, 100) pais!: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 100) nombre_identificativo?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 160) empresa?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 200) direccion_adicional?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 100) provincia?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 100) persona_contacto?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 32) telefono?: string;
  @IsOptional() @Transform(email) @IsEmail() @Length(3, 254) email?: string;
  @IsOptional() @IsBoolean() es_principal?: boolean;
}

export class AddressPatchRequestDto {
  @IsOptional() @IsIn(ADDRESS_USES) uso?: AddressUse;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 160) nombre_destinatario?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 200) direccion?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 20) codigo_postal?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 100) ciudad?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 100) pais?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 100) nombre_identificativo?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 160) empresa?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 200) direccion_adicional?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 100) provincia?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 100) persona_contacto?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 32) telefono?: string;
  @IsOptional() @Transform(email) @IsEmail() @Length(3, 254) email?: string;
  @IsOptional() @IsBoolean() es_principal?: boolean;
}

export class AddressQueryDto { @IsOptional() @IsIn(ADDRESS_USES) uso?: AddressUse; }

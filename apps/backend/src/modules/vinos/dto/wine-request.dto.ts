import { Transform, Type, type TransformFnParams } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';

export const WINE_STATES = ['borrador', 'pendiente_revision', 'publicado', 'oculto', 'archivado'] as const;
export type WineState = (typeof WINE_STATES)[number];
const trim = ({ value }: TransformFnParams): unknown => typeof value === 'string' ? value.trim() : value;
const trimArray = ({ value }: TransformFnParams): unknown => {
  const unknownValue: unknown = value;
  return Array.isArray(unknownValue) ? unknownValue.map((item: unknown) => typeof item === 'string' ? item.trim() : item) : unknownValue;
};

export class WineWriteRequestDto {
  @Transform(trim) @IsString() @Length(1, 160) nombre_comercial!: string;
  @Matches(/^(?!0\.00$)(0|[1-9][0-9]{0,7})\.[0-9]{2}$/) precio!: string;
  @IsIn(['EUR']) moneda!: 'EUR';
  @Type(() => Number) @IsInt() @Min(0) @Max(999999) stock_disponible!: number;
  @IsBoolean() disponible_venta!: boolean;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 100) sku?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 80) tipo_vino?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1800) @Max(2100) anada?: number;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 100) pais?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 160) region?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 160) denominacion_origen?: string;
  @IsOptional() @Transform(trimArray) @IsArray() @ArrayMaxSize(20) @IsString({each:true}) @Length(1,100,{each:true}) variedades_uva?: string[];
  @IsOptional() @Transform(trim) @IsString() @Length(1, 100) crianza?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(120) meses_crianza?: number;
  @IsOptional() @Matches(/^(100\.00|([0-9]|[1-9][0-9])\.[0-9]{2})$/) graduacion_alcoholica?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(10000) volumen_ml?: number;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 500) descripcion_corta?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 5000) descripcion_completa?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 5000) nota_cata?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 5000) maridaje?: string;
  @IsOptional() @Transform(trim) @IsString() @Length(1, 100) temperatura_servicio?: string;
  @IsOptional() @Transform(trimArray) @IsArray() @ArrayMaxSize(20) @IsString({each:true}) @Length(1,100,{each:true}) certificaciones?: string[];
  @IsOptional() @Transform(trimArray) @IsArray() @ArrayMaxSize(20) @IsString({each:true}) @Length(1,100,{each:true}) premios?: string[];
  @IsOptional() @IsBoolean() produccion_limitada?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100000) peso_gramos?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(365) plazo_preparacion_dias?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) botellas_por_caja?: number;
}

export class WineOwnQueryDto {
  @IsOptional() @IsIn(WINE_STATES) estado?: WineState;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 20;
}

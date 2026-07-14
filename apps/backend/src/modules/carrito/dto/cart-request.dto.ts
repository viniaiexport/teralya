import { Type } from 'class-transformer';import { ArrayMaxSize,ArrayMinSize,IsArray,IsInt,IsOptional,IsUUID,Max,Min,ValidateNested } from 'class-validator';
export class CartRequestDto{@IsOptional() @IsUUID() vino_id?:string;@IsOptional() @Type(()=>Number) @IsInt() @Min(1) @Max(999) cantidad?:number;@IsOptional() @IsUUID() fusion_id?:string;@IsOptional() @IsArray() @ArrayMinSize(1) @ArrayMaxSize(100) @ValidateNested({each:true}) @Type(()=>LocalCartItemDto) items?:LocalCartItemDto[];}
export class LocalCartItemDto{@IsUUID() vino_id!:string;@Type(()=>Number) @IsInt() @Min(1) @Max(999) cantidad_local!:number;}
export class QuantityPatchDto{@Type(()=>Number) @IsInt() @Min(1) @Max(999) cantidad!:number;}

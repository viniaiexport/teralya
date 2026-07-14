import { Transform,Type,type TransformFnParams } from 'class-transformer';
import { IsBoolean,IsIn,IsInt,IsOptional,IsString,IsUUID,Length,Matches,Max,Min } from 'class-validator';
const trim=({value}:TransformFnParams):unknown=>typeof value==='string'?value.trim():value;
export class UploadRequestDto{@IsUUID() upload_id!:string;@Transform(trim) @IsString() @Length(1,200) nombre_archivo!:string;@IsIn(['image/jpeg','image/png','image/webp']) content_type!:'image/jpeg'|'image/png'|'image/webp';@Type(()=>Number) @IsInt() @Min(1) @Max(10485760) tamanio_bytes!:number;@Matches(/^[A-Za-z0-9+/]{43}=$/) checksum_sha256!:string;}
export class ImageConfirmRequestDto{@IsUUID() upload_id!:string;@IsString() @Length(32,4096) confirmation_token!:string;@Transform(trim) @IsString() @Length(1,500) alt_text!:string;@IsOptional() @Type(()=>Number) @IsInt() @Min(0) @Max(999) orden?:number;@IsOptional() @IsBoolean() es_principal?:boolean;}
export class ImagePatchRequestDto{@IsOptional() @Transform(trim) @IsString() @Length(1,500) alt_text?:string;@IsOptional() @Type(()=>Number) @IsInt() @Min(0) @Max(999) orden?:number;@IsOptional() @IsBoolean() es_principal?:boolean;}

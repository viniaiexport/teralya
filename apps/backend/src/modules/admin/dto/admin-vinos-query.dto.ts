import { Type } from 'class-transformer';
import { IsIn,IsInt,IsOptional,Max,Min } from 'class-validator';
export class AdminVinosQueryDto{@IsIn(['pendiente_revision']) estado!:'pendiente_revision';@IsOptional() @Type(()=>Number) @IsInt() @Min(1) page=1;@IsOptional() @Type(()=>Number) @IsInt() @Min(1) @Max(100) page_size=20;}

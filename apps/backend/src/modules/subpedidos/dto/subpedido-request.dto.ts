import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { SUBORDER_STATES, type SubOrderState } from './subpedido.dto.js';

export class SubOrderQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page_size = 20;
}
export class SubOrderStatePatchDto { @IsIn(SUBORDER_STATES) estado_destino!: SubOrderState }

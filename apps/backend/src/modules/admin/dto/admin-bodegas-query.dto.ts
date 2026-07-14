import { Transform } from 'class-transformer';
import { IsIn, IsInt, Max, Min } from 'class-validator';

function integerQueryValue(value: unknown): unknown {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    return value;
  }
  return Number(value);
}

export class AdminBodegasQueryDto {
  @IsIn(['pendiente'])
  estado!: 'pendiente';

  @Transform(({ value }: { value: unknown }) => integerQueryValue(value))
  @IsInt()
  @Min(1)
  page = 1;

  @Transform(({ value }: { value: unknown }) => integerQueryValue(value))
  @IsInt()
  @Min(1)
  @Max(100)
  page_size = 20;
}

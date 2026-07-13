import { Transform } from 'class-transformer';
import { IsEmail, Length } from 'class-validator';

export class PasswordRecoveryRequestDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @Length(3, 254)
  email!: string;
}

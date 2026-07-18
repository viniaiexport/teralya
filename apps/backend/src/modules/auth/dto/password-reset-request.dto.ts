import { IsString, Length } from 'class-validator';
import { MatchesProperty } from '../../../common/validation/matches-property.decorator.js';

/** Contrato normativo: components/schemas/PasswordResetRequest (teralya-openapi-v1.1.yaml). */
export class PasswordResetRequestDto {
  @IsString()
  @Length(32, 512)
  token!: string;

  /** Sin trim ni transformación: la contraseña se conserva exactamente como llega. */
  @IsString()
  @Length(12, 128)
  password_nueva!: string;

  @IsString()
  @Length(12, 128)
  @MatchesProperty('password_nueva', { message: 'confirmacion_password debe coincidir con password_nueva.' })
  confirmacion_password!: string;
}

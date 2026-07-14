import { createHmac,timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ConfirmationClaims{v:1;uploadId:string;key:string;vinoId:string;bodegaId:string;usuarioId:string;nombreArchivo:string;contentType:'image/jpeg'|'image/png'|'image/webp';size:number;checksum:string;exp:number}
@Injectable()
export class ConfirmationTokenService{
 private readonly secret:string;constructor(config:ConfigService){this.secret=config.getOrThrow<string>('IMAGE_CONFIRMATION_HMAC_SECRET');}
 issue(claims:ConfirmationClaims):string{const payload=Buffer.from(JSON.stringify(claims)).toString('base64url');return`${payload}.${this.sign(payload)}`;}
 verify(token:string):ConfirmationClaims|null{const parts=token.split('.');if(parts.length!==2)return null;const[payload,signature]=parts;if(payload===undefined||signature===undefined)return null;const expected=this.sign(payload);const actual=Buffer.from(signature);const wanted=Buffer.from(expected);if(actual.length!==wanted.length||!timingSafeEqual(actual,wanted))return null;try{const value:unknown=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));if(!this.claims(value))return null;return value;}catch{return null;}}
 private sign(payload:string):string{return createHmac('sha256',this.secret).update(payload).digest('base64url');}
 private claims(value:unknown):value is ConfirmationClaims{if(typeof value!=='object'||value===null)return false;const c=value as Partial<ConfirmationClaims>;return c.v===1&&typeof c.uploadId==='string'&&typeof c.key==='string'&&typeof c.vinoId==='string'&&typeof c.bodegaId==='string'&&typeof c.usuarioId==='string'&&typeof c.nombreArchivo==='string'&&['image/jpeg','image/png','image/webp'].includes(c.contentType??'')&&typeof c.size==='number'&&typeof c.checksum==='string'&&typeof c.exp==='number';}
}

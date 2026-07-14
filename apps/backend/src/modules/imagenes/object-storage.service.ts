import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const OBJECT_STORAGE=Symbol('OBJECT_STORAGE');
export interface StoredObjectMetadata{contentType?:string;contentLength?:number;checksumSha256?:string}
export interface PresignPutInput{key:string;contentType:string;contentLength:number;checksumSha256:string;expiresInSeconds:number}
export interface ObjectStorageService{presignPut(input:PresignPutInput):Promise<string>;head(key:string):Promise<StoredObjectMetadata|null>}

@Injectable()
export class AwsObjectStorageService implements ObjectStorageService{
 private readonly client:S3Client;private readonly bucket:string;
 constructor(config:ConfigService){this.bucket=config.getOrThrow<string>('OBJECT_STORAGE_BUCKET');const endpoint=config.get<string>('OBJECT_STORAGE_ENDPOINT');const accessKeyId=config.get<string>('OBJECT_STORAGE_ACCESS_KEY_ID');const secretAccessKey=config.get<string>('OBJECT_STORAGE_SECRET_ACCESS_KEY');this.client=new S3Client({region:config.getOrThrow<string>('OBJECT_STORAGE_REGION'),...(endpoint===undefined?{}:{endpoint}),forcePathStyle:config.get<boolean>('OBJECT_STORAGE_FORCE_PATH_STYLE')??false,...(accessKeyId===undefined||secretAccessKey===undefined?{}:{credentials:{accessKeyId,secretAccessKey}})});}
 presignPut(input:PresignPutInput):Promise<string>{return getSignedUrl(this.client,new PutObjectCommand({Bucket:this.bucket,Key:input.key,ContentType:input.contentType,ContentLength:input.contentLength,ChecksumSHA256:input.checksumSha256,IfNoneMatch:'*'}),{expiresIn:input.expiresInSeconds});}
 async head(key:string):Promise<StoredObjectMetadata|null>{try{const result=await this.client.send(new HeadObjectCommand({Bucket:this.bucket,Key:key,ChecksumMode:'ENABLED'}));return{...(result.ContentType===undefined?{}:{contentType:result.ContentType}),...(result.ContentLength===undefined?{}:{contentLength:result.ContentLength}),...(result.ChecksumSHA256===undefined?{}:{checksumSha256:result.ChecksumSHA256})};}catch(error){if((error as {$metadata?:{httpStatusCode?:number}}).$metadata?.httpStatusCode===404)return null;throw error;}}
}

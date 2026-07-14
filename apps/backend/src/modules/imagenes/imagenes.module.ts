import { Module } from '@nestjs/common';
import { ImagenesController } from './imagenes.controller.js';
import { ImagenesRepository } from './imagenes.repository.js';
import { ImagenesService } from './imagenes.service.js';
import { AwsObjectStorageService, OBJECT_STORAGE } from './object-storage.service.js';
import { ConfirmationTokenService } from './confirmation-token.service.js';

@Module({controllers:[ImagenesController],providers:[ImagenesRepository,ImagenesService,ConfirmationTokenService,AwsObjectStorageService,{provide:OBJECT_STORAGE,useExisting:AwsObjectStorageService}]})
export class ImagenesModule {}

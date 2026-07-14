import { Controller,Get,Param,Query,Res } from '@nestjs/common';
import type { Response } from 'express';
import { CatalogService } from './catalog.service.js';
import { CatalogQueryDto } from './dto/catalog-query.dto.js';
import type { PageWineSummary,WinePublicDetail } from './dto/catalog.dto.js';
@Controller('vinos')
export class CatalogController{constructor(private readonly service:CatalogService){}@Get() listar(@Query() query:CatalogQueryDto,@Res({passthrough:true}) response:Response):Promise<PageWineSummary>{response.setHeader('Cache-Control','no-store');return this.service.listar(query);}@Get(':id') obtener(@Param('id') id:string,@Res({passthrough:true}) response:Response):Promise<WinePublicDetail>{response.setHeader('Cache-Control','no-store');return this.service.obtener(id);}}

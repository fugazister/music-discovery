import { Module } from '@nestjs/common';
import { BandcampService } from './bandcamp.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BandcampAlbum } from './bandcamp-album.entity';
import { BandcampController } from './bandcamp.controller';

@Module({
	imports: [HttpModule, TypeOrmModule.forFeature([BandcampAlbum])],
	providers: [BandcampService],
	exports: [BandcampService],
	controllers: [BandcampController]
})
export class BandcampModule {}

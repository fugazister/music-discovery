import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SpotifyAlbum } from './spotify-album.entity';
import { SpotifyController } from './spotify.controller';
import { SpotifyService } from './spotify.service';

@Module({
	imports: [TypeOrmModule.forFeature([SpotifyAlbum]), HttpModule],
	providers: [SpotifyService],
	exports: [SpotifyService],
	controllers: [SpotifyController],
})
export class SpotifyModule {}

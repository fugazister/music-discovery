import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SpotifyAlbum } from './spotify-album.entity';
import { SpotifyController } from './spotify.controller';
import { SpotifyService } from './spotify.service';
import { User } from 'src/library/user.entity';
import { UserAlbum } from 'src/library/user-album.entity';
import { LibraryModule } from 'src/library/library.module';
import { SpotifyArtist } from './spotify-artist.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			SpotifyAlbum,
			SpotifyArtist,
			User,
			UserAlbum
		]),
		HttpModule,
		LibraryModule
	],
	providers: [SpotifyService],
	exports: [SpotifyService],
	controllers: [SpotifyController],
})
export class SpotifyModule {}

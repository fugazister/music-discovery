import { Module } from '@nestjs/common';
import { LibraryService } from './library.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Album } from './album.entity';
import { Artist } from './artist.entity';
import { UserAlbum } from './user-album.entity';
import { User } from './user.entity';
import { LibraryController } from './library.controller';
import { BandcampAlbum } from 'src/bandcamp/bandcamp-album.entity';
import { SpotifyAlbum } from 'src/spotify/spotify-album.entity';
import { SpotifyArtist } from 'src/spotify/spotify-artist.entity';

@Module({
	imports: [TypeOrmModule.forFeature([
		Album,
		Artist,
		UserAlbum,
		User,
		SpotifyAlbum,
		BandcampAlbum,
		SpotifyArtist,
	])],
  providers: [LibraryService],
  controllers: [LibraryController]
})
export class LibraryModule {}

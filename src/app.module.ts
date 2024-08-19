import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BandcampModule } from './bandcamp/bandcamp.module';
import { DiscogsModule } from './discogs/discogs.module';
import { SpotifyModule } from './spotify/spotify.module';
import { SpotifyAlbum } from './spotify/spotify-album.entity';
import { LibraryModule } from './library/library.module';
import { BandcampAlbum } from './bandcamp/bandcamp-album.entity';
import 'dotenv/config';
import { Artist } from './library/artist.entity';
import { Album } from './library/album.entity';
import { SpotifyArtist } from './spotify/spotify-artist.entity';
import { User } from './library/user.entity';
import { UserAlbum } from './library/user-album.entity';
import { BandcampArtist } from './bandcamp/bandcamp-artist.entity';

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: 'localhost',
			port: 5432,
			username: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
			database: 'music',
			entities: [
				Artist,
				Album,
				SpotifyAlbum,
				SpotifyArtist,
				BandcampAlbum,
				BandcampArtist,
				User,
				UserAlbum,
			],
			synchronize: true,
		}),
		BandcampModule,
		DiscogsModule,
		SpotifyModule,
		LibraryModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}

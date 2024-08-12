import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BandcampModule } from './bandcamp/bandcamp.module';
import { DiscogsModule } from './discogs/discogs.module';
import { SpotifyModule } from './spotify/spotify.module';
import { SpotifyAlbum } from './spotify/spotify-album.entity';
import { LibraryModule } from './library/library.module';
import 'dotenv/config';

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
				SpotifyAlbum
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

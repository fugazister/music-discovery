import { Module } from '@nestjs/common';
import { BandcampService } from './bandcamp.service';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BandcampAlbum } from './bandcamp-album.entity';
import { BandcampController } from './bandcamp.controller';
import { LibraryModule } from 'src/library/library.module';
import { User } from 'src/library/user.entity';
import { UserAlbum } from 'src/library/user-album.entity';
import { BandcampArtist } from './bandcamp-artist.entity';
import { BandcampTrack } from './bandcamp-track.entity';
import { BandcampAlbumSubscriber } from './bandcamp-album.subscriber';
import { BullModule } from '@nestjs/bullmq';
import { BandcampConsumer } from './bandcamp.processor';

@Module({
	imports: [
		HttpModule,
		TypeOrmModule.forFeature([
			BandcampAlbum,
			BandcampArtist,
			BandcampTrack,
			User,
			UserAlbum
		]),
		LibraryModule,
		BullModule.registerQueue({
			name: 'bandcamp',
		})
	],
	providers: [BandcampService, BandcampAlbumSubscriber, BandcampConsumer],
	exports: [BandcampService],
	controllers: [BandcampController]
})
export class BandcampModule {}

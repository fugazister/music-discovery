import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent } from 'typeorm';
import { BandcampAlbum } from './bandcamp-album.entity';
import { Injectable } from '@nestjs/common';
import { BandcampService } from './bandcamp.service';

@EventSubscriber()
@Injectable()
export class BandcampAlbumSubscriber implements EntitySubscriberInterface<BandcampAlbum> {
	constructor(
		dataSource: DataSource,
		private bandcampService: BandcampService
	) {
		dataSource.subscribers.push(this);
	}

	listenTo() {
		return BandcampAlbum;
	}

	afterInsert(event: InsertEvent<BandcampAlbum>) {
		this.bandcampService.populateAlbumTrackList(event.entity).subscribe();
	}
}
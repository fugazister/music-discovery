import { Processor, WorkerHost } from '@nestjs/bullmq';
import { BandcampAlbum } from './bandcamp-album.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { forkJoin, from, lastValueFrom, mergeMap, of } from 'rxjs';
import { BandcampArtist } from './bandcamp-artist.entity';

export const SAVE_ALBUM_JOB = 'save-album';

@Processor('bandcamp')
export class BandcampConsumer extends WorkerHost {
	constructor(
		@InjectRepository(BandcampAlbum)
		private readonly bandcampAlbumRepository: Repository<BandcampAlbum>,
		@InjectRepository(BandcampArtist)
		private readonly bandcampArtistRepository: Repository<BandcampArtist>,
	) {
		super();
	}

	process(job): Promise<any> {
		switch (job.name) {
			case SAVE_ALBUM_JOB:
				return this.saveAlbum(job.data);
		}
	}

	saveAlbum({ items, type }): Promise<any> {
		const saveAlbum$ = forkJoin(items.map(item => {
			const artist = this.bandcampArtistRepository.create({
				bandcampId: item.band_id,
				name: item.band_name
			});

			return from(this.bandcampArtistRepository.upsert(artist, ['bandcampId'])).pipe(
				mergeMap(() => {
					const bandcampAlbumEntity = this.bandcampAlbumRepository.create({
						name: item.item_title,
						raw: item,
						bandcampId: item.item_id,
						albumType: type,
						artists: [artist]
					});

					return forkJoin([
						from(this.bandcampAlbumRepository.findOne({
							where: {
								bandcampId: bandcampAlbumEntity.bandcampId
							}
						})),
						of(bandcampAlbumEntity)
					]);
				}),
				mergeMap(([found, bandcampAlbumEntity]) => {
					if (!found) {
						return from(this.bandcampAlbumRepository.save(
							bandcampAlbumEntity
						));
					}

					return of(null);
				})
			)
		}));

		return lastValueFrom(saveAlbum$);
	}
}
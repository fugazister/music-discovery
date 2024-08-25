import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { forkJoin, from, lastValueFrom, mergeMap, of, tap } from 'rxjs';
import { SpotifyAlbum } from './spotify-album.entity';
import { Repository } from 'typeorm';
import { SpotifyArtist } from './spotify-artist.entity';

export const SAVE_ALBUM_JOB = 'save-album';

@Processor('spotify')
export class SpotifyConsumer extends WorkerHost {
	constructor(
		@InjectRepository(SpotifyAlbum)
		private readonly spotifyAlbumRepository: Repository<SpotifyAlbum>,
		@InjectRepository(SpotifyArtist)
		private readonly spotifyArtistRepository: Repository<SpotifyArtist>,
	) {
		super();
	}

	process(job: Job): Promise<any> {
		switch (job.name) {
			case SAVE_ALBUM_JOB:
				return this.saveAlbum(job.data);
		}
	}

	saveAlbum({ items }) {
		const saveAlbum$ = forkJoin(items.map(item => {
			const artists = item.album.artists.map(artist => {
				return this.spotifyArtistRepository.create({
					name: artist.name,
					spotifyId: artist.id,
					raw: artist
				});
			});

			return from(this.spotifyArtistRepository.upsert(artists, ['spotifyId'])).pipe(
				mergeMap((res) => {
					const spotifyAlbumEntity = this.spotifyAlbumRepository.create({
						name: item.album.name,
						raw: item.album,
						spotifyId: item.album.id,
						trackList: item.album.tracks.items,
						artists: artists
					});

					return from(this.spotifyAlbumRepository.findOne({
						where: {
							spotifyId: spotifyAlbumEntity.spotifyId
						}
					})).pipe(mergeMap(found => {
						if (!found) {
							// after saving album notify library to add new album
							return from(this.spotifyAlbumRepository.save(spotifyAlbumEntity));
						}
						return of(null);
					}));
				}),
				tap((entity) => {
					if (entity) {
						
					}
				})
			);
		}));

		return lastValueFrom(saveAlbum$);
	}
}
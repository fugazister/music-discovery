import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { catchError, EMPTY, expand, finalize, forkJoin, from, last, map, merge, mergeMap, Observable, of, tap } from 'rxjs';
import { JSDOM } from 'jsdom';
import { AlbumType, BandcampAlbum } from './bandcamp-album.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LibraryService } from 'src/library/library.service';
import { UserAlbum } from 'src/library/user-album.entity';
import { User } from 'src/library/user.entity';
import { BandcampArtist } from './bandcamp-artist.entity';
import { BandcampTrack } from './bandcamp-track.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SAVE_ALBUM_JOB } from './bandcamp.processor';

const BANDCAMP_SEARCH_URL = 'https://bandcamp.com/search?q=';
const BANDCAMP_LIBRARY_URL = 'https://bandcamp.com/';
const BANDCAMP_COLLECTION_URL = 'https://bandcamp.com/api/fancollection/1/collection_items';
const BANDCAMP_WISHLIST_URL = 'https://bandcamp.com/api/fancollection/1/wishlist_items';

export interface BandcampArtistSearchResult {
	name: string;
	genre: string;
	tags: string[];
	url: string;
}

@Injectable()
export class BandcampService {
	constructor(
		private readonly httpService: HttpService,
		@InjectRepository(BandcampAlbum)
		private readonly bandcampAlbumRepository: Repository<BandcampAlbum>,
		@InjectRepository(BandcampArtist)
		private readonly bandcampArtistRepository: Repository<BandcampArtist>,
		@InjectRepository(UserAlbum)
		private readonly userAlbumRepository: Repository<UserAlbum>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(BandcampTrack)
		private readonly bandcampTrackRepository: Repository<BandcampTrack>,
		private readonly libraryService: LibraryService,
		@InjectQueue('bandcamp')
		private readonly bandcampQueue: Queue
	) {}

	populateUserLibrary(userName: string) {
		return this.getCollection(userName);
	}

	getCollection(userName: string) {
		return this.httpService.get(`${BANDCAMP_LIBRARY_URL}${userName}`).pipe(
			map(response => response.data),
			mergeMap(response => {
				const dom = new JSDOM(response);
				const document = dom.window.document;

				let pageData = JSON.parse(document.getElementById('pagedata').getAttribute('data-blob'));

				const fanId = pageData.fan_data.fan_id;
				const lastToken = pageData.collection_data.last_token;
				const items = pageData.item_cache.collection;
				const wishlistLastToken = pageData.wishlist_data.last_token;

				this.bandcampQueue.add(SAVE_ALBUM_JOB, { items: Object.values(items), type: AlbumType.collection })

				return merge(
					this.makeRequestAndSaveData(lastToken, fanId, AlbumType.collection),
					this.makeRequestAndSaveData(wishlistLastToken, fanId, AlbumType.wishlist)
				);
			}),
			expand(params => {
				if (params.moreAvailable) {
					return this.makeRequestAndSaveData(params.lastToken, params.fanId, params.type);
				} else {
					return EMPTY;
				}
			})
		);
	}

	makeRequestAndSaveData(lastToken: string, fanId: string, type: AlbumType) {
		const url = type === AlbumType.collection ? BANDCAMP_COLLECTION_URL : BANDCAMP_WISHLIST_URL;

		return this.httpService.post(url, {
			count: 30,
			fan_id: fanId,
			older_than_token: lastToken
		}).pipe(
			map(response => response.data),
			map(response => {
				this.bandcampQueue.add(SAVE_ALBUM_JOB, { items: response.items, type })

				return { fanId, lastToken: response.last_token, moreAvailable: response.more_available, type };
			})
		);
	}

	populateAlbumTrackList(album) {
		return this.httpService.get(album.raw.item_url).pipe(
			catchError(error => {
				return EMPTY;
			}),
			map(response => response.data),
			map(response => {
				if (!response) return EMPTY;

				const dom = new JSDOM(response);
				const document = dom.window.document;
				let albumData = '';

				for (let i = 0; i < document.scripts.length; i++) {
					const script = document.scripts.item(i);
					if (script.type === 'application/ld+json') {
						albumData = script.text;
						break;
					}
				}

				if (!albumData) {
					return void 0;
				}
				
				return JSON.parse(albumData);
			}),
			map(albumData => {
				if (!albumData) {
					return EMPTY
				};

				if (!albumData.track) {
					return EMPTY;
				}

				return albumData.track.itemListElement.map(item => {
					return this.bandcampTrackRepository.create({
						album: album,
						name: item.item.name
					});
				});
			}),
			mergeMap(tracks => {
				if (tracks.length > 0) {
					return from(this.bandcampTrackRepository.save(tracks));
				}
				return EMPTY;
			})
		)
	}

	getLibrary() {
		return this.bandcampAlbumRepository.find({
			relations: {
				artists: true
			},
			select: {
				name: true,
				id: true,
				artists: true,
				bandcampId: true,
			}
		});
	}

	search(searchTerm: string): Observable<BandcampArtistSearchResult[]> {
		return this.httpService.get(`${BANDCAMP_SEARCH_URL}${searchTerm}`)
			.pipe(
				map(response => {
					const dom = new JSDOM(response.data);
					const artists: BandcampArtistSearchResult[] = [];

					const searchResults = dom.window.document.querySelectorAll('.result-items .searchresult');

					if (searchResults.length > 0) {
						searchResults.forEach(result => {
							const type = result.querySelector('.itemtype').textContent.trim();

							if (type.toLowerCase() === 'artist') {
								const name = result.querySelector('.heading').textContent.trim();
								const tags = result.querySelector('.tags').textContent.trim().replace('tags:', '').replace(/\n|\r/g, '').split(',').map(item => item.trim());
								const genre = result.querySelector('.genre').textContent.replace('genre:', '').trim();
								const url = result.querySelector('.itemurl a').textContent.trim();
								artists.push({
									name,
									genre,
									tags,
									url
								});
							}
						});
						
						return artists;
					}
				})
			);
	}
}
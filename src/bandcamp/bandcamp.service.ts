import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { EMPTY, expand, map, mergeMap, Observable, tap } from 'rxjs';
import { JSDOM } from 'jsdom';
import { BandcampAlbum } from './bandcamp-album.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

const BANDCAMP_SEARCH_URL = 'https://bandcamp.com/search?q=';
const BANDCAMP_LIBRARY_URL = 'https://bandcamp.com/';
const BANDCAMP_COLLECTION_URL = 'https://bandcamp.com/api/fancollection/1/collection_items';

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
		private readonly bandcampAlbumRepository: Repository<BandcampAlbum>
	) {}

	populateUserLibrary(userName: string) {
		return this.httpService.get(`${BANDCAMP_LIBRARY_URL}${userName}`).pipe(
			map(response => response.data),
			mergeMap(response => {
				const dom = new JSDOM(response);
				const document = dom.window.document;

				let pageData = JSON.parse(document.getElementById('pagedata').getAttribute('data-blob'));

				const fanId = pageData.fan_data.fan_id;
				const lastToken = pageData.collection_data.last_token;
				const itemCache = pageData.item_cache.collection;

				const cache = Object.values(itemCache).map((item: any) => {
					console.log('url', item.item_url);
					return this.bandcampAlbumRepository.create({
						name: item.item_title,
						raw: item,
						bandcampId: item.album_id,
						trackList: []
					});
				});

				this.bandcampAlbumRepository.upsert(cache, ['bandcampId']);

				return this.makeRequestAndSaveData(lastToken, fanId);
			}),
			expand(res => {
				if (res.more_available) {
					const fanId = res.items[0].fan_id;
					return this.makeRequestAndSaveData(res.last_token, fanId);
				} else {
					return EMPTY;
				}
			})
		);
	}

	makeRequestAndSaveData(lastToken: string, fanId: string) {
		return this.httpService.post(BANDCAMP_COLLECTION_URL, {
			count: 30,
			fan_id: fanId,
			older_than_token: lastToken
		}).pipe(map(response => {
			const entities = response.data.items.map(item => {
				const url = item.item_url;
				console.log('url', url);
				return this.bandcampAlbumRepository.create({
					name: item.album_title,
					raw: item,
					bandcampId: item.album_id,
					trackList: []
				});
			});

			this.bandcampAlbumRepository.upsert(entities, ['bandcampId']);

			return response.data;
		}));
	}

	getAlbumInfo(url) {

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
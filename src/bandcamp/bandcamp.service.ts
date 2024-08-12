import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { JSDOM } from 'jsdom';

const BANDCAMP_SEARCH_URL = 'https://bandcamp.com/search?q=';

export interface BandcampArtistSearchResult {
	name: string;
	genre: string;
	tags: string[];
	url: string;
}

@Injectable()
export class BandcampService {
	constructor(private readonly httpService: HttpService) {}

	getUserLibrary() {

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
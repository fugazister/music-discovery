import { Controller, Get, Post } from '@nestjs/common';
import { LibraryService } from './library.service';

@Controller('library')
export class LibraryController {
	constructor(
		private libraryService: LibraryService
	) {}

	@Post('spotify/albums')
	populateAlbumsBySpotify() {
		return this.libraryService.populateAlbumsBySpotify();
	}

	@Post('bandcamp/albums')
	populateAlbumsByBandcamp() {
		return this.libraryService.populateAlbumsByBandcamp();
	}

	@Get('artists')
	getArtists() {
		return this.libraryService.getArtists();
	}
}

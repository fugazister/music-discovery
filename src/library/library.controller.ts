import { Controller, Get, Post } from '@nestjs/common';
import { LibraryService } from './library.service';

@Controller('library')
export class LibraryController {
	constructor(
		private libraryService: LibraryService
	) {}

	@Post('albums')
	populateAlbums() {
		return this.libraryService.populateAlbums();
	}

	@Get('albums')
	getAlbums() {
		return this.libraryService.getAlbums();
	}

	@Get('artists')
	getArtists() {
		return this.libraryService.getArtists();
	}
}

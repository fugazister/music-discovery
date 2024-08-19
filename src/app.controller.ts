import { Controller, Get, OnModuleInit, Param, Post } from '@nestjs/common';
import { BandcampService } from './bandcamp/bandcamp.service';
import { Observable, of } from 'rxjs';
import { LibraryService } from './library/library.service';
import { AppService } from './app.service';


@Controller()
export class AppController implements OnModuleInit {
	constructor(
		private appService: AppService,
		private bandcampService: BandcampService,
		private librarySerivce: LibraryService
	) {}

	onModuleInit() {
		this.librarySerivce.setUser();
	}

	@Get('artist/:name')
	findAll(@Param() params: any): Observable<any> {
		if (!params.name.trim()) return of('uh oh');

		return this.bandcampService.search(params.name.trim());
	}

	@Get('user-albums')
	getUserAlbums() {

	}

	@Post('drop')
	drop() {
		this.appService.dropStuff();
	}
}

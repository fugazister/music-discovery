import { Controller, Get, Param } from '@nestjs/common';
import { BandcampService } from './bandcamp/bandcamp.service';
import { Observable, of } from 'rxjs';


@Controller()
export class AppController {
	constructor(
		private bandcampService: BandcampService
	) {}

	@Get('artist/:name')
	findAll(@Param() params: any): Observable<any> {
		if (!params.name.trim()) return of('uh oh');

		return this.bandcampService.search(params.name.trim());
	}

	@Get('user-albums')
	getUserAlbums() {

	}
}

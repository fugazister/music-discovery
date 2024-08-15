import { Controller, Get, Param, Post } from '@nestjs/common';
import { BandcampService } from './bandcamp.service';

@Controller('bandcamp')
export class BandcampController {
	constructor(private bandcampService: BandcampService) {}

	@Post('populate-albums/:username')
	albums(@Param('username') username: string) {
		return this.bandcampService.populateUserLibrary(username);
	}
}

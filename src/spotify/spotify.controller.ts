import { Controller, Get, Query, Res } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { Response } from 'express';
import { finalize } from 'rxjs';

@Controller('spotify')
export class SpotifyController {
	constructor(private spotifyService: SpotifyService) {}

	@Get('do-auth')
	spotifyDoAuth(@Res() res: Response) {
		return this.spotifyService.doAuth(res);
	}

	@Get('accept-auth')
	spotifyAcceptAuth(@Query() params, @Res() res: Response) {
		return this.spotifyService.acceptAccessToken(params.code).pipe(finalize(() => {
			res.redirect('http://localhost:4200/');
		}));
	}

	@Get('retrieve-user-albums')
	albums() {
		return this.spotifyService.requestUserLikedAlbums();
	}

	@Get('user-albums')
	getAlbums() {
		return this.spotifyService.getLikedAlbums();
	}
}

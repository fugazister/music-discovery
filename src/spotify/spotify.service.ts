import { HttpService } from '@nestjs/axios';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import e, { Response } from 'express';
import { delay, EMPTY, expand, forkJoin, from, iif, map, merge, mergeMap, of, tap } from 'rxjs';
import { URLSearchParams } from 'url';
import { Repository } from 'typeorm';
import { SpotifyAlbum } from './spotify-album.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/library/user.entity';
import { UserAlbum } from 'src/library/user-album.entity';
import { LibraryService } from 'src/library/library.service';
import { SpotifyArtist } from './spotify-artist.entity';
import { SpotifySession } from './spotify-session.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SAVE_ALBUM_JOB } from './spotify.processor';

@Injectable()
export class SpotifyService {
	constructor(
		private readonly httpService: HttpService,
		@InjectRepository(SpotifyArtist)
		private readonly spotifyArtistRepository: Repository<SpotifyArtist>,
		@InjectRepository(SpotifyAlbum)
		private readonly spotifyAlbumRepository: Repository<SpotifyAlbum>,
		@InjectRepository(SpotifySession)
		private readonly sessionRepository: Repository<SpotifySession>,
		private readonly libraryService: LibraryService,
		@InjectQueue('spotify')
		private readonly spotifyQueue: Queue
	) {}

	doAuth(res: Response) {
		const params = new URLSearchParams({
			response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: 'user-library-read',
      redirect_uri: 'http://localhost:3000/spotify/accept-auth'
		});

		return res.redirect('https://accounts.spotify.com/authorize?' + params.toString());
	}

	acceptAccessToken(code: string) {
		const requestParams: AxiosRequestConfig = {
			url: 'https://accounts.spotify.com/api/token',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
			},
			data: new URLSearchParams({
				grant_type: 'authorization_code',
				code,
				redirect_uri: 'http://localhost:3000/spotify/accept-auth'
			}),
		};

		return this.httpService.request(requestParams).pipe(mergeMap(result => {
			return this.libraryService.getUser().pipe(mergeMap(user => {
				return from(this.sessionRepository.upsert({
					refreshToken: result.data.refresh_token,
					accessToken: result.data.access_token,
					expiresIn: result.data.expires_in,
					user
				}, ['user.id']));
			}))
		}));
	}

	refreshAccessToken(refreshToken) {
		const requestParams: AxiosRequestConfig = {
			url: 'https://accounts.spotify.com/api/token',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			data: new URLSearchParams({
				grant_type: 'refresh_token',
				refresh_token: refreshToken,
				client_id: process.env.SPOTIFY_CLIENT_ID
			})
		};

		return this.httpService.request(requestParams).pipe(mergeMap(result => {
			return this.libraryService.getUser().pipe(mergeMap(user => {
				return from(this.sessionRepository.upsert({
					refreshToken: result.data.refresh_token,
					accessToken: result.data.access_token,
					expiresIn: result.data.expires_in,
					user
				}, ['user.id']));
			}))
		}));
	}

	makeRequestAndSaveData(url: string) {
		return this.libraryService.getUser().pipe(
			mergeMap(user => {
				if (!user) return EMPTY;

				return this.sessionRepository.findOne({
					where: {
						user: user
					}
				})
			}),
			mergeMap(session => {
				if (!session) return EMPTY;

				const currentTime = new Date();
				const expiresAt = new Date();
				expiresAt.setSeconds(expiresAt.getSeconds() + session.expiresIn);

				return iif(
					() => expiresAt < currentTime,
					this.refreshAccessToken(session.refreshToken).pipe(mergeMap(() => {
						return this.makeRequestAndSaveData(url);
					})),
					this.httpService.request({
						method: 'GET',
						url,
						headers: { 'Authorization': 'Bearer ' + session.accessToken },
					})
				).pipe(
					mergeMap((result: any) => {
						const items = result.data.items;
		
						if (items.length > 0) {
							this.spotifyQueue.add(SAVE_ALBUM_JOB, { items: items });
						}
		
						return of(result.data);
					})
				);
			})
		);
	}

	requestUserLikedAlbums() {
		const queryParams = new URLSearchParams({
			limit: '50',
			offset: '0',
		});

		const url = 'https://api.spotify.com/v1/me/albums?' + queryParams.toString();

		return this.makeRequestAndSaveData(url).pipe(
			expand((res: any) => {
				if (res.next) {
					return this.makeRequestAndSaveData(res.next);
				} else {
					return EMPTY;
				}
			}),
		);
	}

	getLikedAlbums() {
		return this.spotifyAlbumRepository.find({
			relations: {
				artists: true
			}
		});
	}
}

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { Response } from 'express';
import { delay, EMPTY, expand, map, tap } from 'rxjs';
import { URLSearchParams } from 'url';
import { Repository } from 'typeorm';
import { SpotifyAlbum } from './spotify-album.entity';
import { InjectRepository } from '@nestjs/typeorm';

interface SpotifyAccessInfo {
	accessToken: string;
	tokenType: string;
	refreshToken: string;
}

@Injectable()
export class SpotifyService {
	access: SpotifyAccessInfo;

	constructor(
		private readonly httpService: HttpService,
		@InjectRepository(SpotifyAlbum)
		private readonly spotifyAlbumRepository: Repository<SpotifyAlbum>
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

		return this.httpService.request(requestParams).pipe(map(result => {
			this.access = {
				accessToken: result.data.access_token,
				tokenType: result.data.token_type,
				refreshToken: result.data.refresh_token
			};

			return result.data;
		}));
	}

	refreshAccessToken(refreshToken) {
	
	}

	makeRequestAndSaveData(url: string) {
		const requestParams = {
			method: 'GET',
			url,
			headers: { 'Authorization': 'Bearer ' + this.access.accessToken },
			json: true
		};

		return this.httpService.request(requestParams).pipe(
			map(result => result.data),
			tap(result => {
				if (result.items.length > 0) {
					const entities = result.items.map(item => {
						return this.spotifyAlbumRepository.create({
							name: item.album.name,
							raw: item.album,
							spotifyId: item.album.id,
							trackList: item.album.tracks.items
						});
					});

					this.spotifyAlbumRepository.upsert(entities, ['spotifyId']);
				}
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
			expand(res => {
				if (res.next) {
					return this.makeRequestAndSaveData(res.next);
				} else {
					return EMPTY;
				}
			}),
		);
	}

	getLikedAlbums() {
		return this.spotifyAlbumRepository.find();
	}
}

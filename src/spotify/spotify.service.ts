import { HttpService } from '@nestjs/axios';
import { ConsoleLogger, Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { Response } from 'express';
import { delay, EMPTY, expand, forkJoin, from, map, merge, mergeMap, of, tap } from 'rxjs';
import { URLSearchParams } from 'url';
import { Repository } from 'typeorm';
import { SpotifyAlbum } from './spotify-album.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/library/user.entity';
import { UserAlbum } from 'src/library/user-album.entity';
import { LibraryService } from 'src/library/library.service';
import { SpotifyArtist } from './spotify-artist.entity';

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
		@InjectRepository(SpotifyArtist)
		private readonly spotifyArtistRepository: Repository<SpotifyArtist>,
		@InjectRepository(SpotifyAlbum)
		private readonly spotifyAlbumRepository: Repository<SpotifyAlbum>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(UserAlbum)
		private readonly userAlbumRepository: Repository<UserAlbum>,
		private readonly libraryService: LibraryService
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
			mergeMap(result => {
				const items = result.data.items;

				if (items.length > 0) {
					return forkJoin(items.map(item => {
						const artists = item.album.artists.map(artist => {
							return this.spotifyArtistRepository.create({
								name: artist.name,
								spotifyId: artist.id,
								raw: artist
							});
						});

						return from(this.spotifyArtistRepository.upsert(artists, ['spotifyId'])).pipe(
							mergeMap((res) => {
								console.log('spotifyArtistRepository.upsert', res)
								const spotifyAlbumEntity = this.spotifyAlbumRepository.create({
									name: item.album.name,
									raw: item.album,
									spotifyId: item.album.id,
									trackList: item.album.tracks.items,
									artists: artists
								});

								return from(this.spotifyAlbumRepository.findOne({
									where: {
										spotifyId: spotifyAlbumEntity.spotifyId
									}
								})).pipe(mergeMap(found => {
									if (!found) {
										return from(this.spotifyAlbumRepository.save(spotifyAlbumEntity));
									}
									return of(null);
								}));
							})
						);

					})).pipe(map(() => result.data));
				}

				return of(result.data);
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
		return this.spotifyAlbumRepository.find({
			relations: {
				artists: true
			}
		});
	}
}

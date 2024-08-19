import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { Response } from 'express';
import { delay, EMPTY, expand, map, tap } from 'rxjs';
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

	makeRequestAndSaveData(url: string, user: User) {
		const requestParams = {
			method: 'GET',
			url,
			headers: { 'Authorization': 'Bearer ' + this.access.accessToken },
			json: true
		};

		return this.httpService.request(requestParams).pipe(
			map(result => result.data),
			tap(async result => {
				const items = result.items;

				if (items.length > 0) {

					for (const item of items) {
						const artistEntities = item.album.artists.map(async artist => {
							const found = await this.spotifyArtistRepository.findOne({
								where: {
									spotifyId: artist.id,
									name: artist.name,
								}
							});

							if (found) {
								return found;
							}

							if (!found) {
								console.log('name', artist.name, 'found', found);

								const newArtist = this.spotifyArtistRepository.create({
									spotifyId: artist.id,
									name: artist.name,
									raw: artist
								});

								await this.spotifyArtistRepository.save(newArtist);

								return newArtist;
							}
						});

						const resolvedArtists = await Promise.all(artistEntities);

						const spotifyAlbumEntity = this.spotifyAlbumRepository.create({
							name: item.album.name,
							raw: item.album,
							spotifyId: item.album.id,
							trackList: item.album.tracks.items,
							artists: resolvedArtists
						});

						const foundAlbum = await this.spotifyAlbumRepository.findOne({
							where: {
								spotifyId: spotifyAlbumEntity.spotifyId
							},
							relations: {
								artists: true
							}
						});

						if (!foundAlbum) {
							return await this.spotifyAlbumRepository.save(spotifyAlbumEntity);
						}

						if (foundAlbum) {
							foundAlbum.artists = [...spotifyAlbumEntity.artists, ...foundAlbum.artists];
							return await this.spotifyAlbumRepository.save(foundAlbum);
						}
					}
				}
			})
		);
	}

	async requestUserLikedAlbums() {
		const queryParams = new URLSearchParams({
			limit: '50',
			offset: '0',
		});

		const url = 'https://api.spotify.com/v1/me/albums?' + queryParams.toString();

		const user = await this.userRepository.findOne({
			where: {
				name: 'me'
			}
		});

		return this.makeRequestAndSaveData(url, user).pipe(
			expand(res => {
				if (res.next) {
					return this.makeRequestAndSaveData(res.next, user);
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

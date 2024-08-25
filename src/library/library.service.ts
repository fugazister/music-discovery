import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Album } from './album.entity';
import { Repository } from 'typeorm';
import { Artist } from './artist.entity';
import { UserAlbum } from './user-album.entity';
import { User } from './user.entity';
import { SpotifyAlbum } from 'src/spotify/spotify-album.entity';
import { BandcampAlbum } from 'src/bandcamp/bandcamp-album.entity';
import { SpotifyArtist } from 'src/spotify/spotify-artist.entity';
import { catchError, EMPTY, forkJoin, from, map, merge, mergeMap, tap, zip } from 'rxjs';

@Injectable()
export class LibraryService {
	constructor(
		@InjectRepository(Album)
		private readonly albumRepository: Repository<Album>,
		@InjectRepository(Artist)
		private readonly artistRepository: Repository<Artist>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(UserAlbum)
		private readonly userAlbumRepository: Repository<UserAlbum>,
		@InjectRepository(SpotifyArtist)
		private readonly spotifyArtistRepository: Repository<SpotifyArtist>,
		@InjectRepository(SpotifyAlbum)
		private readonly spotifyAlbumRepository: Repository<SpotifyAlbum>,
		@InjectRepository(BandcampAlbum)
		private readonly bandcampAlbumRepository: Repository<BandcampAlbum>
	) {}

	setUser() {
		return from(this.userRepository.findOne({
			where: {
				name: 'me'
			}
		})).pipe(mergeMap(user => {
			if (!user) {
				return this.userRepository.insert({
					name: 'me'
				});
			}

			return EMPTY;
		}))
	}

	getUser() {
		return from(this.userRepository.findOne({
			where: {
				name: 'me'
			}
		}));
	}

	getArtists() {
		return this.artistRepository.find();
	}

	populateAlbums() {
		return from(this.spotifyAlbumRepository.find({
			relations: {
				artists: true
			},
			select: {
				id: true,
				name: true,
				spotifyId: true,
				artists: {
					name: true
				}
			}
		})).pipe(
			mergeMap(albums => {
				return from(albums.map(album => {
					return this.albumRepository.create({
						spotifyAlbum: album,
						artists: album.artists,
						name: album.name,
					});
				}));
			}),
			mergeMap(albumEntity => {
				return from(this.bandcampAlbumRepository.findOne({
					relations: {
						artists: true,
					},
					select: {
						id: true,
						bandcampId: true,
						name: true,
						artists: {
							name: true
						}
					},
					where: {
						name: albumEntity.name,
						artists: albumEntity.artists
					}
				})).pipe(
					map(found => {
						if (found) {
							albumEntity.bandcampAlbum = found;
						}

						return albumEntity;
					})
				)
			}),
			mergeMap(albumEntity => {
				return this.albumRepository.save(albumEntity);
			}),
			catchError((error, entity) => {
				if (error) {
					console.error('error saving album', entity, error);
					return EMPTY;
				}
			})
		);
	}

	getAlbums() {
		return from(this.albumRepository.find({
			relations: {
				bandcampAlbum: true,
				spotifyAlbum: true,
			}
		}));
	}
}

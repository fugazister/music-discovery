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


	async populateAlbumsBySpotify() {
		const albums = await this.spotifyAlbumRepository.find();

		return albums[0];
	}

	async populateAlbumsByBandcamp() {
		const albums = await this.bandcampAlbumRepository.find();
		albums.map(album => {
			// do we need to update or create new?
			// how do we know if album from spotify is similar to bandcamp album
		});

		return albums[0];
	}

	getArtists() {
		return this.artistRepository.find();
	}
}

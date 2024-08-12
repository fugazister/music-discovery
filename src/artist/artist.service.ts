import { Injectable } from '@nestjs/common';
import { InsertResult, Repository } from 'typeorm';
import { Artist } from './artist.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ArtistService {
		constructor(
				@InjectRepository(Artist)
				private artistRepository: Repository<Artist>,
		) {}

		createArtistRecord(artistName: string): Promise<InsertResult> {
				return this.artistRepository.insert({ name: artistName });
		}

		// must be central method to retrieve data from possible services
		// TODO: implement discogs, spotify, bandcamp, etc.
		populateArtistInfo() {

		}
}

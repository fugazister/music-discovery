
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BandcampAlbum } from './bandcamp-album.entity';

@Entity()
export class BandcampTrack {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => BandcampAlbum)
	album: BandcampAlbum;

	@Column('text')
	name: string;
}
import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, Unique, ManyToMany, JoinTable } from 'typeorm';
import { BandcampArtist } from './bandcamp-artist.entity';

@Entity()
@Unique(['bandcampId'])
export class BandcampAlbum {
	@PrimaryGeneratedColumn()
	id: number;

	@PrimaryColumn()
	bandcampId: string;

	@Column('text')
	name: string;

	@ManyToMany(() => BandcampArtist)
	@JoinTable()
	artists: BandcampArtist[];

	@Column('jsonb')
	raw: any;
}
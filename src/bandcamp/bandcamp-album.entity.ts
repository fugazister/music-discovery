import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, Unique, ManyToMany, JoinTable } from 'typeorm';
import { BandcampArtist } from './bandcamp-artist.entity';

export enum AlbumType {
	wishlist = 'wishlist',
	collection = 'collection'
}

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

	@Column({
		type: 'enum',
		enum: ['wishlist', 'collection'],
		default: AlbumType.collection
	})
	albumType: AlbumType

	@Column('jsonb')
	raw: any;
}

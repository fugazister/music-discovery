import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SpotifyAlbum {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('text')
	spotifyId: string;

	@Column('text')
	name: string;

	@Column('json')
	raw: any;
}
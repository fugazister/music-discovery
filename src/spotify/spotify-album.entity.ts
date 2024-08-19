import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, Unique, ManyToMany, JoinTable } from 'typeorm';
import { SpotifyArtist } from './spotify-artist.entity';

@Entity()
@Unique(['spotifyId'])
export class SpotifyAlbum {
	@PrimaryGeneratedColumn()
	id: number;

	@PrimaryColumn('text')
	spotifyId: string;

	@Column('text')
	name: string;

	@Column('jsonb', { nullable: true })
	raw: any;

	@Column('jsonb', { nullable: true })
	trackList: any;

	@ManyToMany(() => SpotifyArtist)
	@JoinTable()
	artists: SpotifyArtist[];
}
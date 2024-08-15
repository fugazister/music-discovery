import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, Unique } from 'typeorm';

@Entity()
@Unique(['spotifyId'])
export class SpotifyAlbum {
	@PrimaryGeneratedColumn()
	id: number;

	@PrimaryColumn('text')
	spotifyId: string;

	@Column('text')
	name: string;

	@Column('jsonb', { nullable: false })
	raw: any;

	@Column('jsonb', { nullable: false })
	trackList: any;
}
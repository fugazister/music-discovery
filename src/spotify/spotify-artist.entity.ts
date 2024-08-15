import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(['spotifyId'])
export class SpotifyArtist {
	@PrimaryGeneratedColumn()
	id: number;

	@PrimaryColumn('text')
	spotifyId: string;

	@Column('text')
	name: string;

	@Column('jsonb')
	spotifyMeta: any;
}
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['spotifyId', 'bandcampId'])
export class Artist {
	@PrimaryGeneratedColumn()
	id: number;

	@PrimaryColumn('text')
	name: string;

	@PrimaryColumn('text')
	spotifyId: string;

	@PrimaryColumn('text')
	bandcampId: string;

	@Column('jsonb')
	spotifyMeta: any;
}
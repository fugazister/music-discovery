import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['spotifyId', 'bandcampId'])
export class Artist {
	@PrimaryGeneratedColumn()
	id: number;

	@PrimaryColumn('text')
	name: string;

	@Column('text', { nullable: true })
	spotifyId: string;

	@Column('text', { nullable: true })
	bandcampId: string;
}
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['bandcampId'])
export class BandcampArtist {
	@PrimaryGeneratedColumn()
	id: number;

	@PrimaryColumn('text')
	bandcampId: string;

	@Column('text')
	name: string;
}
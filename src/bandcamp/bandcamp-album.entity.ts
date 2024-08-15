import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, Unique } from 'typeorm';

@Entity()
@Unique(['bandcampId'])
export class BandcampAlbum {
	@PrimaryGeneratedColumn()
	id: number;

	@PrimaryColumn()
	bandcampId: string;

	@Column('text')
	name: string;

	@Column('jsonb')
	raw: any;

	@Column('jsonb')
	trackList: any;
}
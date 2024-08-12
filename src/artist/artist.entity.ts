import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Artist {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;
}
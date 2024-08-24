import { Column, Entity, ManyToOne,PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

// knows if user has album in some service
@Entity()
export class UserAlbum {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, user => user.albums)
	user: User;

	@Column()
	name: string;

	@Column({ nullable: true })
	spotifyId: string;

	@Column({ nullable: true })
	bandcampId: string;
}
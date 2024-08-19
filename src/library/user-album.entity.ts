import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Album } from './album.entity';

// knows if user has album in some service
@Entity()
@Unique(['album.id'])
export class UserAlbum {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, user => user.albums)
	user: User;

	@OneToOne(() => Album)
	@JoinColumn()
	album: Album;

	@Column({
		nullable: true,
	})
	hasSpotifyAlbum: boolean;

	@Column({
		nullable: true,
	})
	hasBandcampAlbum: boolean;
}
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

// knows if user has album in some service
@Entity()
export class UserAlbum {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(() => User)
	@JoinColumn()
	user: User;

	@Column()
	hasSpotifyAlbum: boolean;

	@Column()
	hasBandcampAlbum: boolean;
}
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserAlbum } from "./user-album.entity";

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;
	
	@Column('text')
	name: string;

	@OneToMany(() => UserAlbum, album => album.user)
	albums: UserAlbum[];
}
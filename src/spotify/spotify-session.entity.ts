import { User } from 'src/library/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class SpotifySession {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('text')
	refreshToken: string;

	@Column('text')
	accessToken: string;

	@OneToOne(() => User)
	@JoinColumn()
	user: User;

	@UpdateDateColumn()
	updatedAt: Date;

	@Column()
	expiresIn: number;
}
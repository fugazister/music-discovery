import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Artist } from './artist.entity';
import { SpotifyAlbum } from 'src/spotify/spotify-album.entity';
import { BandcampAlbum } from 'src/bandcamp/bandcamp-album.entity';

@Entity()
@Unique(['bandcampAlbum.bandcampId', 'spotifyAlbum.spotifyId'])
export class Album {
	@PrimaryGeneratedColumn()
	id: number;

	@OneToOne(() => SpotifyAlbum)
	@JoinColumn()
	spotifyAlbum: SpotifyAlbum;

	@OneToOne(() => BandcampAlbum)
	@JoinColumn()
	bandcampAlbum: BandcampAlbum;

	@Column('text')
	name: string;

	@ManyToMany(() => Artist)
	@JoinTable()
	artists: Artist[];
}
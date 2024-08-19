import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LibraryService } from './library/library.service';

@Injectable()
export class AppService {
	constructor(
		private dataSource: DataSource,
		private libraryService: LibraryService
	) {}

	async dropStuff() {
		await this.dataSource.dropDatabase();

		return this.libraryService.setUser();
	}
}

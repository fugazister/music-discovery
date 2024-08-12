import { Test, TestingModule } from '@nestjs/testing';
import { BandcampService } from './bandcamp.service';

describe('BandcampService', () => {
	let service: BandcampService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [BandcampService],
		}).compile();

		service = module.get<BandcampService>(BandcampService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});

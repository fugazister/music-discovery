import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('library')
export class LibraryConsumer extends WorkerHost {
	constructor() {
		super();
	}

	process(job: Job, token?: string): Promise<any> {
		
	}
}
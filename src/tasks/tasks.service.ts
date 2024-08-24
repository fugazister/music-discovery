import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from './task.entity';
import { Repository } from 'typeorm';

export enum TaskStatus {
	new = 'new',
	started = 'started',
	success = 'success',
	failed = 'failed',
}

export class Task {
	status: TaskStatus = TaskStatus.new;
	isCompleted = false;
	meta: any;
	id: number;

	constructor(private service: TasksService) {
		this.service.createEntity(this).then(entity => {
			this.id = entity.id;
		});
	}

	started() {
		this.status = TaskStatus.started;
		this.isCompleted = false;

		this.service.updateEntity(this);
	}

	failed(reason: any) {
		this.status = TaskStatus.failed;
		this.meta = reason;
		this.isCompleted = true;

		this.service.updateEntity(this);
	}

	completed() {
		if (this.status === TaskStatus.failed) return;
		this.status = TaskStatus.success;
		this.isCompleted = true;

		this.service.updateEntity(this);
	}

	getStatus() {
		return this.status;
	}
}

@Injectable()
export class TasksService {
	constructor(
		@InjectRepository(TaskEntity)
		private readonly taskRepository: Repository<TaskEntity>
	) {}

	createTask() {
		const task = new Task(this);

		return task;
	}

	createEntity(task: Task) {
		const entity = this.taskRepository.create({
			status: task.status,
			isCompleted: task.isCompleted,
			meta: task.meta,
		});

		return this.taskRepository.save(entity);
	}

	updateEntity(task: Task) {
		const entity = this.taskRepository.create({
			status: task.status,
			isCompleted: task.isCompleted,
			meta: task.meta,
		});

		return this.taskRepository.update({ id: task.id }, entity);
	}
}
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { TaskStatus } from "./tasks.service";

@Entity()
export class TaskEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('text')
	status: TaskStatus;

	@Column('boolean')
	isCompleted: boolean;

	@Column('jsonb', { nullable: true })
	meta: any;
}
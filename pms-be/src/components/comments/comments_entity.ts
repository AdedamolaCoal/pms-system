import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	JoinColumn,
	OneToOne,
} from "typeorm";
import { Users } from "../users/users_entity";
import { Tasks } from "../tasks/tasks_entity";

@Entity()
export class Comments {
	@PrimaryGeneratedColumn("uuid")
	comment_id: string;

	@Column({ type: "text" })
	comment: string;

	@Column()
	@OneToOne(() => Users, (user) => user.user_id)
	@JoinColumn({ name: "user_id" })
	user_id: string;

	@Column()
	@OneToOne(() => Tasks, (task) => task.task_id)
	@JoinColumn({ name: "task_id" })
	task_id: string;

	@Column("text", { array: true, default: [] })
	supported_files: Array<string>;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
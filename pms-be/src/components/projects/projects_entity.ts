import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity()
export class Projects {
	@PrimaryGeneratedColumn("uuid")
	project_id: string;

	@Column({ length: 30, nullable: false, unique: true })
	name: string;

	@Column({ length: 500 })
	description: string;

	@Column("uuid", { array: true, default: [] })
	user_ids: Array<string>;

	@Column()
	start_time: Date;

	@Column()
	end_time: Date;

	@CreateDateColumn()
	creation_date: Date;

	@UpdateDateColumn()
	update_date: Date;
}

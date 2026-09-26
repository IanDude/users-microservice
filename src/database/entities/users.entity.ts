import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({
  name: 'users',
  schema: 'dbo',
})
export class Users extends BaseEntity {
  @Column({ unique: true })
  username!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;
}

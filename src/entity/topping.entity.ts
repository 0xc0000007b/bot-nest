import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ToppingEntity {
  @PrimaryGeneratedColumn('increment')
  id: number
  @Column()
  type: string
}

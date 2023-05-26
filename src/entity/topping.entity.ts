import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Topping {
  @PrimaryGeneratedColumn('increment')
  id: number
  @Column()
  type: string
}

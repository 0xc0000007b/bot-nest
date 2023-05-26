import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Topping } from "./topping.entity";

@Entity()
export class Pizza {
  @PrimaryGeneratedColumn('increment')
  id: number
  @Column()
  type: string
  @Column()
  orderDate: string
  @Column()
  orderTime: string
  @ManyToMany(() => Topping)
  toppings: Topping[]

}

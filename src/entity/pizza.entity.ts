import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Topping } from "./topping.entity";

@Entity()
export class Pizza {
  @PrimaryGeneratedColumn('increment')
  id: number
  @Column({default: ''})
  type: string
  @Column({default: ''})
  orderDate: string
  @Column({default: ''})
  orderTime: string
  @ManyToMany(() => Topping)
  @JoinTable()
  toppings: Topping[]

}

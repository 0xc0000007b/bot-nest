import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PizzaEntity } from "./entity/pizza.entity";

@Injectable()
export class AppService {
  constructor(@InjectRepository(PizzaEntity) readonly  pizzaRepo: Repository<PizzaEntity> ) {}
  async writePizzaToDb(item: PizzaEntity) {
    const pizza = new PizzaEntity()
    pizza.type = item.type
    pizza.orderDate = item.orderDate
    pizza.orderTime = item.orderTime
    pizza.toppings = item.toppings
    await   this.pizzaRepo.save(pizza)
  }
   getAll() {

    return   this.pizzaRepo.find()
  }
}

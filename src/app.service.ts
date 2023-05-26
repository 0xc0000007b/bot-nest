import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Pizza } from "./entity/pizza.entity";

@Injectable()
export class AppService {
  constructor(@InjectRepository(Pizza) readonly  pizzaRepo: Repository<Pizza> ) {}
  async writePizzaToDb(item: Pizza) {
    const pizza = new Pizza()
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

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Pizza } from "./entity/pizza.entity";
import { Topping } from "./entity/topping.entity";

import {config} from "dotenv";
import * as process from "process";
import { TelegrafModule } from "nestjs-telegraf";
import { AppUpdate } from "./bot/app.update";

config()

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.TOKEN
    }),
    TypeOrmModule.forFeature([Topping, Pizza]),
    TypeOrmModule.forRoot({
    type: 'mysql',
    host: 'sql.freedb.tech',
    port: 3306,
    username: 'freedb_test-bot',
    password: 'q456sV$Vs99*paV',
    database: 'freedb_test-bot',
    dropSchema: false,
    entities: [Pizza, Topping],
    synchronize: true,
  })],
  controllers: [AppController, AppUpdate ],
  providers: [AppService, AppUpdate],
})
export class AppModule {

  constructor() {
  }
}

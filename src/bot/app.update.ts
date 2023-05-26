import { Ctx, InjectBot, Message, On, Start, Update } from "nestjs-telegraf";
import { Context, Markup, Telegraf, Telegram } from "telegraf";
import { webApp } from "telegraf/typings/button";
import { calcTime } from "../utils/utils";
import axios from "axios";
import { Controller, Get, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import TelegramBot from "node-telegram-bot-api";
import { AppService } from "../app.service";


@Controller()
@Update()
export class AppUpdate {
  webAppUrl: string = 'https://web-tg-app.netlify.app'
  constructor(@InjectBot() private bot: Telegraf<Context>,
              private appService: AppService) {}

  @Start()
  sendHi(@Message() msg: string, @Ctx() ctx: Context) {
    ctx.sendMessage('Привет. Нажми на кнопку, чтобы сделвть заказ', Markup.inlineKeyboard([
      Markup.button.webApp('купить пиццу', this.webAppUrl)
    ]))
    setTimeout(() => {
      ctx.sendMessage('чтобы отправить адрес,  нажмите кнопку с изображением 4 точки, потом на кнопку "заполнить форму"', Markup.keyboard([
        Markup.button.webApp('Заполнить форму', this.webAppUrl + '/form')
      ]))
    }, 1000)
  }
  @On('web_app_data')
  async sendMessage(@Message() msg: string, @Ctx() ctx: Context) {

    if (ctx?.webAppData?.data) {
      const data: any = JSON.parse(ctx?.webAppData?.data.text());
        console.log(data);
      const time = await this.calcDeliveryTime(data?.address)
      try {
        ctx.sendMessage(`Ваш адрес ${data?.address} заказ уже в пути, ожидайте курьера. Время ошидания: ${time} `)
      }catch (e) {}
    }


}

  @Post('/web-data')
  async getQueries(@Req() req: Request, @Res() res: Response) {
    const {queryId, pizzas = [], totalPrice} = req.body
    console.log(pizzas);
    if (totalPrice > 0) {
      await this.bot.telegram.answerWebAppQuery(queryId, {
        type: 'article',
        title: 'удачная покупка',
        id: queryId,
        input_message_content: {
          message_text: `Поздравляю с удачной покупкой! Вы купили на сумму: ${totalPrice}.\n
          Ваш заказ: ${pizzas.map((item) => {
            this.appService.writePizzaToDb(item)
            return '\n🍕 ' + item.type
          })}`
        }
      })
    }}
  @Get('/pizza')
   async  getPizzas() {
    console.log(await this.appService.getAll());
    return  this.appService.getAll()
  }
async calcDeliveryTime(address: string) {
  const origin: string = 'Новотушинская 5';
  const baseUrl: string = 'https://nominatim.openstreetmap.org';
  const mode: string = 'driving';

  const timeToWait: number = 10;
  const originResponse = await axios.get(
    `${baseUrl}/search?format=json&q=${origin}`
  );
  const originLatLong = {
    lat: originResponse.data[0].lat,
    lng: originResponse.data[0].lon,
  };

  const moscowCoords = { lat: 55.7558, lng: 37.6173 };
  const boundRadius = 50000;
  const viewboxCoords = {
    minLat: moscowCoords.lat - boundRadius / 111300,
    maxLat: moscowCoords.lat + boundRadius / 111300,
    minLng:
      moscowCoords.lng - boundRadius / (111300 * Math.cos(moscowCoords.lat)),
    maxLng:
      moscowCoords.lng + boundRadius / (111300 * Math.cos(moscowCoords.lat)),
  };

  const destinationResponse = await axios.get(
    `${baseUrl}/search?format=json&street=${address?.toLowerCase()}&countrycodes=RUS&viewbox=${
      viewboxCoords.minLng
    },${viewboxCoords.minLat},${viewboxCoords.maxLng},${
      viewboxCoords.maxLat
    }&bounded=1`
  );
  if (!destinationResponse.data.length) {
    throw new Error('Неверный адрес доставки');
  }
  const destinationLatLng = {
    lat: destinationResponse.data[0].lat,
    lng: destinationResponse.data[0].lon,
  };
  const routeResponse = await axios.get(
    `https://router.project-osrm.org/route/v1/${mode}/${originLatLong.lng},${originLatLong.lat};${destinationLatLng.lng},${destinationLatLng.lat}?overview=false`
  );
  const routeDurationSeconds = routeResponse.data.routes[0].duration;
  const fixedTimeMinutes = 15;
  const deliveryTimePerPizzaMinutes = 15;
  const returnTimeMinutes = 15;
  const waitingTimeBetweenOrdersMinutes = timeToWait;
  const totalTimeSeconds =
    fixedTimeMinutes +
    (2 * deliveryTimePerPizzaMinutes + 2 * returnTimeMinutes) +
    waitingTimeBetweenOrdersMinutes +
    routeDurationSeconds;
  const hours = Math.floor(totalTimeSeconds / 3600);
  const minutes = Math.floor((totalTimeSeconds % 3600) / 60);
  const seconds = Math.floor(totalTimeSeconds % 60);
  const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return formattedDuration
}



}

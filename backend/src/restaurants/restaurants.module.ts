import { Module } from "@nestjs/common";
import { RestaurantResolver } from "./restaurants.resolver";
import { RestaurantService } from "./restaurants.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Restaurant } from "./entities/restaurant.entity";
import { Category } from "./entities/category.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Category])],
  providers: [RestaurantResolver, RestaurantService],
  exports: [RestaurantService],
})
export class RestaurantModule {
  constructor() {
    console.log("constructor restaurant module called");
  }
}

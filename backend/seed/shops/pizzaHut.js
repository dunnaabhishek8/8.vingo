import { shopImages, foodImages } from "../imageUrls.js";

export const pizzaHut = {
  name:"Pizza Hut",
  city:"Hyderabad",
  state:"Telangana",
  address:"Jubilee Hills",
  image:shopImages.pizzaHut,

  items:[
    {name:"Margherita Pizza",image:foodImages.margherita,category:"Pizza",price:219,foodType:"veg"},
    {name:"Farmhouse Pizza",image:foodImages.farmhousePizza,category:"Pizza",price:349,foodType:"veg"},
    {name:"Chicken Pizza",image:foodImages.chickenPizza,category:"Pizza",price:429,foodType:"non veg"},
    {name:"Pepperoni Pizza",image:foodImages.pepperoniPizza,category:"Pizza",price:469,foodType:"non veg"},
    {name:"Cheese Burst Pizza",image:foodImages.cheeseBurst,category:"Pizza",price:499,foodType:"veg"},
    {name:"Garlic Bread",image:foodImages.garlicBread,category:"Snacks",price:159,foodType:"veg"},
    {name:"French Fries",image:foodImages.fries,category:"Fast Food",price:129,foodType:"veg"},
    {name:"Brownie",image:foodImages.brownie,category:"Desserts",price:139,foodType:"veg"},
    {name:"Pepsi",image:foodImages.pepsi,category:"Others",price:60,foodType:"veg"},
    {name:"Ice Cream",image:foodImages.iceCream,category:"Desserts",price:99,foodType:"veg"}
  ]
};
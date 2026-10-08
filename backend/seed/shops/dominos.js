import { shopImages, foodImages } from "../imageUrls.js";

export const dominos = {
  name:"Domino's Pizza",
  city:"Hyderabad",
  state:"Telangana",
  address:"Gachibowli",
  image:shopImages.dominos,

  items:[
    {name:"Margherita",image:foodImages.margherita,category:"Pizza",price:199,foodType:"veg"},
    {name:"Farmhouse Pizza",image:foodImages.farmhousePizza,category:"Pizza",price:329,foodType:"veg"},
    {name:"Chicken Pizza",image:foodImages.chickenPizza,category:"Pizza",price:399,foodType:"non veg"},
    {name:"Pepperoni Pizza",image:foodImages.pepperoniPizza,category:"Pizza",price:449,foodType:"non veg"},
    {name:"Cheese Burst",image:foodImages.cheeseBurst,category:"Pizza",price:469,foodType:"veg"},
    {name:"Garlic Bread",image:foodImages.garlicBread,category:"Snacks",price:149,foodType:"veg"},
    {name:"Brownie",image:foodImages.brownie,category:"Desserts",price:129,foodType:"veg"},
    {name:"Coke",image:foodImages.coke,category:"Others",price:60,foodType:"veg"},
    {name:"Sprite",image:foodImages.sprite,category:"Others",price:60,foodType:"veg"},
    {name:"Pepsi",image:foodImages.pepsi,category:"Others",price:60,foodType:"veg"}
  ]
};
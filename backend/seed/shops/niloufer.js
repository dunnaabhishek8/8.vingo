import { shopImages, foodImages } from "../imageUrls.js";

export const niloufer = {
  name:"Cafe Niloufer",
  city:"Hyderabad",
  state:"Telangana",
  address:"Lakdikapul",
  image:shopImages.niloufer,

  items:[
    {name:"Irani Tea",image:foodImages.tea,category:"Others",price:40,foodType:"veg"},
    {name:"Filter Coffee",image:foodImages.coffee,category:"Others",price:60,foodType:"veg"},
    {name:"Veg Sandwich",image:foodImages.sandwich,category:"Sandwiches",price:140,foodType:"veg"},
    {name:"Chicken Sandwich",image:foodImages.sandwich,category:"Sandwiches",price:170,foodType:"non veg"},
    {name:"Brownie",image:foodImages.brownie,category:"Desserts",price:140,foodType:"veg"},
    {name:"Ice Cream",image:foodImages.iceCream,category:"Desserts",price:120,foodType:"veg"},
    {name:"Garlic Bread",image:foodImages.garlicBread,category:"Snacks",price:130,foodType:"veg"},
    {name:"French Fries",image:foodImages.fries,category:"Fast Food",price:120,foodType:"veg"},
    {name:"Lassi",image:foodImages.lassi,category:"Others",price:90,foodType:"veg"},
    {name:"Pepsi",image:foodImages.pepsi,category:"Others",price:40,foodType:"veg"},
    {name:"Sprite",image:foodImages.sprite,category:"Others",price:40,foodType:"veg"},
    {name:"Fanta",image:foodImages.fanta,category:"Others",price:40,foodType:"veg"}
  ]
};
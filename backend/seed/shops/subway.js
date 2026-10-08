import { shopImages, foodImages } from "../imageUrls.js";

export const subway = {
  name:"Subway",
  city:"Hyderabad",
  state:"Telangana",
  address:"Ameerpet",
  image:shopImages.subway,

  items:[
    {name:"Veg Sandwich",image:foodImages.sandwich,category:"Sandwiches",price:179,foodType:"veg"},
    {name:"Chicken Sandwich",image:foodImages.sandwich,category:"Sandwiches",price:229,foodType:"non veg"},
    {name:"Paneer Sandwich",image:foodImages.sandwich,category:"Sandwiches",price:199,foodType:"veg"},
    {name:"French Fries",image:foodImages.fries,category:"Fast Food",price:119,foodType:"veg"},
    {name:"Garlic Bread",image:foodImages.garlicBread,category:"Snacks",price:149,foodType:"veg"},
    {name:"Coffee",image:foodImages.coffee,category:"Others",price:90,foodType:"veg"},
    {name:"Tea",image:foodImages.tea,category:"Others",price:50,foodType:"veg"},
    {name:"Brownie",image:foodImages.brownie,category:"Desserts",price:120,foodType:"veg"},
    {name:"Sprite",image:foodImages.sprite,category:"Others",price:60,foodType:"veg"},
    {name:"Mineral Water",image:foodImages.water,category:"Others",price:20,foodType:"veg"}
  ]
};
import { shopImages, foodImages } from "../imageUrls.js";

export const mcdonalds = {
  name: "McDonald's",
  city: "Hyderabad",
  state: "Telangana",
  address: "Hitech City",
  image: shopImages.mcdonalds,

  items: [
    { name:"McAloo Tikki", image:foodImages.vegBurger, category:"Burgers", price:89, foodType:"veg"},
    { name:"McChicken", image:foodImages.chickenBurger, category:"Burgers", price:179, foodType:"non veg"},
    { name:"Cheese Burger", image:foodImages.cheeseBurger, category:"Burgers", price:159, foodType:"veg"},
    { name:"French Fries", image:foodImages.fries, category:"Fast Food", price:119, foodType:"veg"},
    { name:"Chicken Nuggets", image:foodImages.chicken65, category:"Fast Food", price:199, foodType:"non veg"},
    { name:"Brownie", image:foodImages.brownie, category:"Desserts", price:99, foodType:"veg"},
    { name:"Coke", image:foodImages.coke, category:"Others", price:60, foodType:"veg"},
    { name:"Sprite", image:foodImages.sprite, category:"Others", price:60, foodType:"veg"},
    { name:"Fanta", image:foodImages.fanta, category:"Others", price:60, foodType:"veg"},
    { name:"Ice Cream", image:foodImages.iceCream, category:"Desserts", price:79, foodType:"veg"}
  ]
};
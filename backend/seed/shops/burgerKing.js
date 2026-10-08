import { shopImages, foodImages } from "../imageUrls.js";

export const burgerKing = {
  name: "Burger King",
  city: "Hyderabad",
  state: "Telangana",
  address: "Kondapur",
  image: shopImages.burgerKing,

  items: [
    { name:"Whopper", image:foodImages.chickenBurger, category:"Burgers", price:249, foodType:"non veg"},
    { name:"Veg Whopper", image:foodImages.vegBurger, category:"Burgers", price:199, foodType:"veg"},
    { name:"Cheese Burger", image:foodImages.cheeseBurger, category:"Burgers", price:169, foodType:"veg"},
    { name:"Chicken Burger", image:foodImages.chickenBurger, category:"Burgers", price:199, foodType:"non veg"},
    { name:"French Fries", image:foodImages.fries, category:"Fast Food", price:119, foodType:"veg"},
    { name:"Chicken Fries", image:foodImages.chicken65, category:"Fast Food", price:229, foodType:"non veg"},
    { name:"Pepsi", image:foodImages.pepsi, category:"Others", price:60, foodType:"veg"},
    { name:"Brownie", image:foodImages.brownie, category:"Desserts", price:99, foodType:"veg"},
    { name:"Ice Cream", image:foodImages.iceCream, category:"Desserts", price:99, foodType:"veg"},
    { name:"Coffee", image:foodImages.coffee, category:"Others", price:80, foodType:"veg"}
  ]
};
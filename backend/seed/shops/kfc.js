import { shopImages, foodImages } from "../imageUrls.js";

export const kfc = {
  name: "KFC",
  city: "Hyderabad",
  state: "Telangana",
  address: "Madhapur",
  image: shopImages.kfc,

  items: [
    { name:"Zinger Burger", image:foodImages.chickenBurger, category:"Burgers", price:220, foodType:"non veg"},
    { name:"Chicken Bucket", image:foodImages.chicken65, category:"Fast Food", price:699, foodType:"non veg"},
    { name:"Hot Wings", image:foodImages.chicken65, category:"Fast Food", price:249, foodType:"non veg"},
    { name:"Chicken Popcorn", image:foodImages.chicken65, category:"Fast Food", price:199, foodType:"non veg"},
    { name:"French Fries", image:foodImages.fries, category:"Fast Food", price:129, foodType:"veg"},
    { name:"Veg Burger", image:foodImages.vegBurger, category:"Burgers", price:149, foodType:"veg"},
    { name:"Pepsi", image:foodImages.pepsi, category:"Others", price:60, foodType:"veg"},
    { name:"Brownie", image:foodImages.brownie, category:"Desserts", price:99, foodType:"veg"},
    { name:"Ice Cream", image:foodImages.iceCream, category:"Desserts", price:99, foodType:"veg"},
    { name:"Mineral Water", image:foodImages.water, category:"Others", price:20, foodType:"veg"}
  ]
};
import { shopImages, foodImages } from "../imageUrls.js";

export const shadab = {
  name: "Hotel Shadab",
  city: "Hyderabad",
  state: "Telangana",
  address: "Ghansi Bazaar, Charminar",
  image: shopImages.shadab,

  items: [
    { name:"Chicken Biryani", image:foodImages.chickenBiryani, category:"Main Course", price:320, foodType:"non veg"},
    { name:"Mutton Biryani", image:foodImages.muttonBiryani, category:"Main Course", price:450, foodType:"non veg"},
    { name:"Chicken Curry", image:foodImages.chickenCurry, category:"Main Course", price:320, foodType:"non veg"},
    { name:"Butter Chicken", image:foodImages.butterChicken, category:"Main Course", price:350, foodType:"non veg"},
    { name:"Chicken 65", image:foodImages.chicken65, category:"Snacks", price:250, foodType:"non veg"},
    { name:"Apollo Fish", image:foodImages.apolloFish, category:"Snacks", price:340, foodType:"non veg"},
    { name:"Haleem", image:foodImages.haleem, category:"Main Course", price:300, foodType:"non veg"},
    { name:"Veg Biryani", image:foodImages.vegBiryani, category:"Main Course", price:220, foodType:"veg"},
    { name:"Gulab Jamun", image:foodImages.gulabJamun, category:"Desserts", price:110, foodType:"veg"},
    { name:"Sprite", image:foodImages.sprite, category:"Others", price:40, foodType:"veg"},
    { name:"Lassi", image:foodImages.lassi, category:"Others", price:80, foodType:"veg"},
    { name:"Mineral Water", image:foodImages.water, category:"Others", price:20, foodType:"veg"},
  ]
};
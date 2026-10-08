import { shopImages, foodImages } from "../imageUrls.js";

export const bawarchi = {
  name: "Bawarchi",
  city: "Hyderabad",
  state: "Telangana",
  address: "RTC X Roads, Hyderabad",
  image: shopImages.bawarchi,

  items: [
    {
      name: "Chicken Biryani",
      image: foodImages.chickenBiryani,
      category: "Main Course",
      price: 315,
      foodType: "non veg",
    },
    {
      name: "Mutton Biryani",
      image: foodImages.muttonBiryani,
      category: "Main Course",
      price: 445,
      foodType: "non veg",
    },
    {
      name: "Egg Biryani",
      image: foodImages.eggBiryani,
      category: "Main Course",
      price: 220,
      foodType: "non veg",
    },
    {
      name: "Chicken 65",
      image: foodImages.chicken65,
      category: "Snacks",
      price: 240,
      foodType: "non veg",
    },
    {
      name: "Apollo Fish",
      image: foodImages.apolloFish,
      category: "Snacks",
      price: 340,
      foodType: "non veg",
    },
    {
      name: "Chicken Curry",
      image: foodImages.chickenCurry,
      category: "Main Course",
      price: 300,
      foodType: "non veg",
    },
    {
      name: "Butter Chicken",
      image: foodImages.butterChicken,
      category: "Main Course",
      price: 345,
      foodType: "non veg",
    },
    {
      name: "Veg Fried Rice",
      image: foodImages.friedRice,
      category: "Chinese",
      price: 180,
      foodType: "veg",
    },
    {
      name: "Chicken Noodles",
      image: foodImages.noodles,
      category: "Chinese",
      price: 210,
      foodType: "non veg",
    },
    {
      name: "Brownie",
      image: foodImages.brownie,
      category: "Desserts",
      price: 140,
      foodType: "veg",
    },
    {
      name: "Pepsi",
      image: foodImages.pepsi,
      category: "Others",
      price: 40,
      foodType: "veg",
    },
    {
      name: "Ice Cream",
      image: foodImages.iceCream,
      category: "Desserts",
      price: 120,
      foodType: "veg",
    }
  ]
};
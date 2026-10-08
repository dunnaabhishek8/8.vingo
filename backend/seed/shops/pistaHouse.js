import { shopImages, foodImages } from "../imageUrls.js";

export const pistaHouse = {
  name: "Pista House",
  city: "Hyderabad",
  state: "Telangana",
  address: "Charminar, Hyderabad",
  image: shopImages.pistaHouse,

  items: [
    {
      name: "Chicken Biryani",
      image: foodImages.chickenBiryani,
      category: "Main Course",
      price: 330,
      foodType: "non veg",
    },
    {
      name: "Mutton Biryani",
      image: foodImages.muttonBiryani,
      category: "Main Course",
      price: 460,
      foodType: "non veg",
    },
    {
      name: "Haleem Special",
      image: foodImages.haleem,
      category: "Main Course",
      price: 320,
      foodType: "non veg",
    },
    {
      name: "Chicken 65",
      image: foodImages.chicken65,
      category: "Snacks",
      price: 250,
      foodType: "non veg",
    },
    {
      name: "Butter Chicken",
      image: foodImages.butterChicken,
      category: "Main Course",
      price: 350,
      foodType: "non veg",
    },
    {
      name: "Chicken Curry",
      image: foodImages.chickenCurry,
      category: "Main Course",
      price: 310,
      foodType: "non veg",
    },
    {
      name: "Tandoori Chicken",
      image: foodImages.tandooriChicken,
      category: "Main Course",
      price: 430,
      foodType: "non veg",
    },
    {
      name: "Veg Biryani",
      image: foodImages.vegBiryani,
      category: "Main Course",
      price: 210,
      foodType: "veg",
    },
    {
      name: "Paneer Butter Masala",
      image: foodImages.paneerButterMasala,
      category: "Main Course",
      price: 260,
      foodType: "veg",
    },
    {
      name: "Gulab Jamun",
      image: foodImages.gulabJamun,
      category: "Desserts",
      price: 120,
      foodType: "veg",
    },
    {
      name: "Lassi",
      image: foodImages.lassi,
      category: "Others",
      price: 80,
      foodType: "veg",
    },
    {
      name: "Mineral Water",
      image: foodImages.water,
      category: "Others",
      price: 20,
      foodType: "veg",
    }
  ]
};
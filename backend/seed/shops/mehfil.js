import { shopImages, foodImages } from "../imageUrls.js";

export const mehfil = {
  name: "Mehfil Restaurant",
  city: "Hyderabad",
  state: "Telangana",
  address: "Narayanguda, Hyderabad",
  image: shopImages.mehfil,

  items: [
    {
      name: "Chicken Dum Biryani",
      image: foodImages.chickenBiryani,
      category: "Main Course",
      price: 310,
      foodType: "non veg",
    },
    {
      name: "Mutton Dum Biryani",
      image: foodImages.muttonBiryani,
      category: "Main Course",
      price: 430,
      foodType: "non veg",
    },
    {
      name: "Egg Dum Biryani",
      image: foodImages.eggBiryani,
      category: "Main Course",
      price: 210,
      foodType: "non veg",
    },
    {
      name: "Veg Dum Biryani",
      image: foodImages.vegBiryani,
      category: "Main Course",
      price: 200,
      foodType: "veg",
    },
    {
      name: "Chicken 65",
      image: foodImages.chicken65,
      category: "Snacks",
      price: 240,
      foodType: "non veg",
    },
    {
      name: "Butter Chicken",
      image: foodImages.butterChicken,
      category: "Main Course",
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
      name: "Apollo Fish",
      image: foodImages.apolloFish,
      category: "Snacks",
      price: 330,
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
      price: 190,
      foodType: "non veg",
    },
    {
      name: "Double Ka Meetha",
      image: foodImages.doubleKaMeetha,
      category: "Desserts",
      price: 130,
      foodType: "veg",
    },
    {
      name: "Pepsi",
      image: foodImages.pepsi,
      category: "Others",
      price: 40,
      foodType: "veg",
    }
  ]
};
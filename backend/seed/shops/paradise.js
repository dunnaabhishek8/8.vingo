import { shopImages, foodImages } from "../imageUrls.js";

export const paradise = {
  name: "Paradise Biryani",
  city: "Hyderabad",
  state: "Telangana",
  address: "SD Road, Secunderabad",
  image: shopImages.paradise,

  items: [
    {
      name: "Chicken Biryani",
      image: foodImages.chickenBiryani,
      category: "Main Course",
      price: 320,
      foodType: "non veg",
    },
    {
      name: "Special Chicken Biryani",
      image: foodImages.chickenBiryani,
      category: "Main Course",
      price: 390,
      foodType: "non veg",
    },
    {
      name: "Family Pack Chicken Biryani",
      image: foodImages.chickenBiryani,
      category: "Main Course",
      price: 850,
      foodType: "non veg",
    },
    {
      name: "Mutton Biryani",
      image: foodImages.muttonBiryani,
      category: "Main Course",
      price: 450,
      foodType: "non veg",
    },
    {
      name: "Egg Biryani",
      image: foodImages.eggBiryani,
      category: "Main Course",
      price: 230,
      foodType: "non veg",
    },
    {
      name: "Veg Biryani",
      image: foodImages.vegBiryani,
      category: "Main Course",
      price: 220,
      foodType: "veg",
    },
    {
      name: "Chicken 65",
      image: foodImages.chicken65,
      category: "Snacks",
      price: 260,
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
      name: "Butter Chicken",
      image: foodImages.butterChicken,
      category: "Main Course",
      price: 360,
      foodType: "non veg",
    },
    {
      name: "Haleem",
      image: foodImages.haleem,
      category: "Main Course",
      price: 290,
      foodType: "non veg",
    },
    {
      name: "Double Ka Meetha",
      image: foodImages.doubleKaMeetha,
      category: "Desserts",
      price: 140,
      foodType: "veg",
    },
    {
      name: "Coke",
      image: foodImages.coke,
      category: "Others",
      price: 40,
      foodType: "veg",
    }
  ]
};
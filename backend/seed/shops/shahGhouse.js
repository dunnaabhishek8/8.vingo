import { shopImages, foodImages } from "../imageUrls.js";

export const shahGhouse = {
  name: "Shah Ghouse",
  city: "Hyderabad",
  state: "Telangana",
  address: "Tolichowki, Hyderabad",
  image: shopImages.shahGhouse,

  items: [
    {
      name: "Special Chicken Biryani",
      image: foodImages.chickenBiryani,
      category: "Main Course",
      price: 340,
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
      name: "Chicken Family Pack",
      image: foodImages.chickenBiryani,
      category: "Main Course",
      price: 890,
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
      price: 210,
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
      name: "Tandoori Chicken",
      image: foodImages.tandooriChicken,
      category: "Main Course",
      price: 420,
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
      name: "Apollo Fish",
      image: foodImages.apolloFish,
      category: "Snacks",
      price: 360,
      foodType: "non veg",
    },
    {
      name: "Haleem",
      image: foodImages.haleem,
      category: "Main Course",
      price: 300,
      foodType: "non veg",
    },
    {
      name: "Qubani Ka Meetha",
      image: foodImages.qubaniKaMeetha,
      category: "Desserts",
      price: 150,
      foodType: "veg",
    },
    {
      name: "Sprite",
      image: foodImages.sprite,
      category: "Others",
      price: 40,
      foodType: "veg",
    }
  ]
};
import { shopImages, foodImages } from "../imageUrls.js";

export const kritunga = {
  name:"Kritunga",
  city:"Hyderabad",
  state:"Telangana",
  address:"Kukatpally",
  image:shopImages.kritunga,

  items:[
    {name:"Andhra Chicken Curry",image:foodImages.chickenCurry,category:"Main Course",price:340,foodType:"non veg"},
    {name:"Chicken Biryani",image:foodImages.chickenBiryani,category:"Main Course",price:330,foodType:"non veg"},
    {name:"Mutton Biryani",image:foodImages.muttonBiryani,category:"Main Course",price:470,foodType:"non veg"},
    {name:"Chicken Fry",image:foodImages.chicken65,category:"Snacks",price:260,foodType:"non veg"},
    {name:"Apollo Fish",image:foodImages.apolloFish,category:"Snacks",price:350,foodType:"non veg"},
    {name:"Veg Meals",image:foodImages.vegBiryani,category:"Main Course",price:220,foodType:"veg"},
    {name:"Paneer Butter Masala",image:foodImages.paneerButterMasala,category:"Main Course",price:260,foodType:"veg"},
    {name:"Gobi Manchurian",image:foodImages.gobiManchurian,category:"Chinese",price:210,foodType:"veg"},
    {name:"Mushroom Curry",image:foodImages.mushroomCurry,category:"Main Course",price:250,foodType:"veg"},
    {name:"Tea",image:foodImages.tea,category:"Others",price:30,foodType:"veg"},
    {name:"Coke",image:foodImages.coke,category:"Others",price:40,foodType:"veg"},
    {name:"Ice Cream",image:foodImages.iceCream,category:"Desserts",price:110,foodType:"veg"}
  ]
};
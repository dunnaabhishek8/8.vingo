import { shopImages, foodImages } from "../imageUrls.js";

export const chutneys = {
  name:"Chutneys",
  city:"Hyderabad",
  state:"Telangana",
  address:"Banjara Hills",
  image:shopImages.chutneys,

  items:[
    {name:"Masala Dosa",image:foodImages.vegBiryani,category:"South Indian",price:140,foodType:"veg"},
    {name:"Plain Dosa",image:foodImages.vegBiryani,category:"South Indian",price:110,foodType:"veg"},
    {name:"Ghee Dosa",image:foodImages.vegBiryani,category:"South Indian",price:170,foodType:"veg"},
    {name:"Idli",image:foodImages.vegBiryani,category:"South Indian",price:80,foodType:"veg"},
    {name:"Vada",image:foodImages.vegBiryani,category:"South Indian",price:90,foodType:"veg"},
    {name:"Poori",image:foodImages.vegBiryani,category:"South Indian",price:110,foodType:"veg"},
    {name:"Paneer Butter Masala",image:foodImages.paneerButterMasala,category:"Main Course",price:260,foodType:"veg"},
    {name:"Paneer Tikka",image:foodImages.paneerTikka,category:"Snacks",price:280,foodType:"veg"},
    {name:"Dal Tadka",image:foodImages.dalTadka,category:"Main Course",price:190,foodType:"veg"},
    {name:"Filter Coffee",image:foodImages.coffee,category:"Others",price:60,foodType:"veg"},
    {name:"Tea",image:foodImages.tea,category:"Others",price:40,foodType:"veg"},
    {name:"Brownie",image:foodImages.brownie,category:"Desserts",price:120,foodType:"veg"}
  ]
};
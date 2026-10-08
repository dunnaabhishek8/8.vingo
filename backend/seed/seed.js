import mongoose from "mongoose";
import dotenv from "dotenv";

import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";
import { shops } from "./data.js";

dotenv.config();

const OWNER_ID = "6a72c111744b20d612452bed";

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);

    console.log("✅ MongoDB Connected");

    console.log("Total shops:", shops.length);

    for (const shopData of shops) {
      console.log("Processing:", shopData.name);

      const { items, ...shopInfo } = shopData;

      let shop = await Shop.findOne({
        name: shopInfo.name,
        city: shopInfo.city,
      });

      if (!shop) {
        shop = await Shop.create({
          ...shopInfo,
          owner: OWNER_ID,
        });

        console.log("✅ Created:", shop.name);
      } else {
        console.log("ℹ️ Already exists:", shop.name);
      }

      for (const itemData of items) {
        const exists = await Item.findOne({
          name: itemData.name,
          shop: shop._id,
        });

        if (exists) continue;

        const item = await Item.create({
          ...itemData,
          shop: shop._id,
          rating: {
            average: Number((4 + Math.random()).toFixed(1)),
            count: Math.floor(Math.random() * 500) + 50,
          },
        });

        shop.items.push(item._id);
      }

      await shop.save();
    }

    console.log("🎉 Database Seeded Successfully!");

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
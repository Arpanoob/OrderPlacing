import connectDB from "../models/db";
import { Inventory } from "../models/inventory.model";
import '../config/loadEnv';

const seedInventory = async () => {
    await connectDB();

    await Inventory.deleteMany({});

    const products = [
        { productId: "prod1", stock: 10, name: "Shirt" },
        { productId: "prod2", stock: 5, name: "Jeans" },
        { productId: "prod3", stock: 0, name: "Sunglasses" }
    ];

    await Inventory.insertMany(products);
    console.log("Inventory seeded!");
    process.exit();
};

seedInventory();

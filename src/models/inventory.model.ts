import mongoose, { Document, Schema } from "mongoose";
import { InventoryDocument } from "../interface/inventory.interface";
import { options } from "../enums/options.enum";


const inventorySchema = new Schema<InventoryDocument>({
    productId: { type: String, required: true, unique: true },
    stock: { type: Number, required: true, min: 0 },
    name: { type: String, required: true }
});

export const Inventory = mongoose.model<InventoryDocument>(options.INVENTORY_SCHEMA, inventorySchema);

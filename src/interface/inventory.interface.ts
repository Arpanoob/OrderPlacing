export interface InventoryDocument extends Document {
    productId: string;
    stock: number;
    name: string;
}
import { ORDERS } from "../enums/orders.enum";

export interface Product {
    productId: string;
    quantity: number;
}

export interface OrderDocument extends Document {
    orderId: string;
    userId: string;
    items: Product[];
    totalAmount: number;
    status: keyof typeof ORDERS;
}

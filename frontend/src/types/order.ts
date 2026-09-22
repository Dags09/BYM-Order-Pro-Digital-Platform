import type { User } from "./user";

export interface ReceiptItem {
    product: string;
    quantity: number;
    price: number;
    subtotal: number;
}

export interface Receipt {
    orderId: string;
    customerName: string;
    items: ReceiptItem[];
    totalAmount: number;
    status: string;
    note?: string;
}

export interface CreateOrderResponse {
    message: string;
    order: Record<string, unknown>;
    receipt: Receipt;
}

export type PaymentMethod = "cod" | "gcash" | "maya";

export interface ShippingAddress {
    street: string;
    city: string;
    province: string;
    zipCode: string;
}

export type OrderStatus =
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";

export interface OrderProduct {
    _id: string;
    name: string;
    price: number;
    imageUrl?: string;
}

export interface OrderItemDetailed {
    product: OrderProduct;
    quantity: number;
    price: number;
}

export interface OrderCustomer {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
}

export interface DriverLocation {
    latitude: number | null;
    longitude: number | null;
    updatedAt: string | null;
}

export interface Order {
    _id: string;
    customer: OrderCustomer;
    items: OrderItemDetailed[];
    totalAmount: number;
    note?: string | null;
    status: OrderStatus;
    shippingAddress: ShippingAddress;
    scheduledDeliveryDate?: string | null;
    driver?: User;
    driverLocation?: DriverLocation;
    paymentMethod: PaymentMethod;
    paymentStatus: "pending" | "paid" | "failed";
    createdAt: string;
    updatedAt: string;
}

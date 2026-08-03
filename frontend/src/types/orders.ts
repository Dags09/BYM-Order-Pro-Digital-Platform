import type { OrderStatus } from "../utils/constants";

export interface OrderCustomer {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    badgeColor?: string;
}

export interface OrderDriver {
    _id: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    badgeColor?: string;
}

export interface OrderProduct {
    _id: string;
    name: string;
    imageUrl?: string;
}

export interface OrderItem {
    product?: OrderProduct | string;
    name?: string;
    quantity?: number;
    qty?: number;
    price: number;
}

export interface OrderDriver {
    _id: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
}

export interface ShippingAddress {
    street?: string;
    city?: string;
    province?: string;
    zipCode?: string;
    country?: string;
}

export interface Order {
    _id: string;
    status: OrderStatus;
    paymentStatus?: string;
    paymentMethod?: string;
    customer?: OrderCustomer;
    items?: OrderItem[];
    totalAmount: number;
    createdAt: string;
    driver?: OrderDriver;
    shippingAddress?: ShippingAddress;
    scheduledDeliveryDate?: string;
    note?: string;
    _justPlaced?: boolean;
}

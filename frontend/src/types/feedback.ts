import type { OrderStatus } from "../utils/constants";

export interface FeedbackCustomer {
    firstName?: string;
    lastName?: string;
    email?: string;
    badgeColor?: string;
}

export interface FeedbackOrder {
    _id: string;
    totalAmount: number;
    status: OrderStatus;
}

export interface Feedback {
    _id: string;
    rating?: number;
    comment?: string;
    createdAt: string;
    customer?: FeedbackCustomer;
    order?: FeedbackOrder;
}

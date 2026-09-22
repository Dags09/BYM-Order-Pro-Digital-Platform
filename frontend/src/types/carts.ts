export interface CartItem {
    productId: string;
    name: string;
    price: number;
    imageUrl?: string;
    quantity: number;
}

export interface CartItemRowProps {
    item: CartItem;
    compact?: boolean;
}

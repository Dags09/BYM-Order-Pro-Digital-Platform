export interface QRCodeEntry {
    _id: string;
    type: "gcash" | "maya";
    imageUrl: string;
    accountName: string;
    accountNumber: string;
    isActive: boolean;
}

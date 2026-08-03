export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    username?: string;
    phoneNumber?: string;
    email: string;
    role: string;
    badgeColor?: string;
    isActive?: boolean;
    emailVerified?: boolean;
    createdAt?: string;
    lastLogin?: string;
    location?: {
        address?: string;
        city?: string;
        province?: string;
        zipCode?: string;
        country?: string;
    };
}

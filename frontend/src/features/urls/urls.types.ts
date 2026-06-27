export type CreateUrlInput = {
    originalUrl: string;
};

export type Url = {
    id: string;
    originalUrl: string;
    shortCode: string;
    clicks: number;
    createdAt: string;
};
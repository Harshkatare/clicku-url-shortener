export type CreateUrlInput = {
    originalUrl: string;
};

export type Url = {
    id: string;
    originalUrl: string;
    shortCode: string;
    clicks: number;
    createdAt: string;
    updatedAt: string;
};

export type CreateUrlResponse = {
    success: boolean;
    data: Url;
};

export type GetUrlsResponse = {
    success: boolean;
    data: Url[];
};
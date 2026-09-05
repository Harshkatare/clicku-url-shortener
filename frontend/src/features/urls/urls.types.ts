export type CreateUrlInput = {
    originalUrl: string;
};

export type UpdateUrlInput = {
    originalUrl: string;
};

export type Url = {
    id: string;
    userId: string;
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

export type UpdateUrlResponse = {
    success: boolean;
    data: Url;
};

export type GetUrlsResponse = {
    success: boolean;
    data: Url[];
};

export type ClaimUrlInput = {
    shortCode: string;
};

export type ClaimUrlResponse = {
    success: boolean;
    message?: string;
    data: Url;
};
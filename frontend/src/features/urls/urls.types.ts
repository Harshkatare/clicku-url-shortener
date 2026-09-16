export type UrlStatus = "active" | "expiring" | "archived";

export type Url = {
  id: string;
  userId: string | null;
  originalUrl: string;
  shortCode: string;
  customAlias: string | null;
  status: UrlStatus;
  sortOrder: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
};

export type UrlPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type UrlQueryFilters = {
  search?: string;
  status?: UrlStatus | "all";
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "clicks" | "sortOrder";
  sortDir?: "asc" | "desc";
};

export type CreateUrlInput = {
  originalUrl: string;
  customAlias?: string;
  status?: UrlStatus;
};

export type UpdateUrlInput = {
  originalUrl?: string;
  customAlias?: string | null;
  status?: UrlStatus;
};

export type ReorderUrlInput = {
  newSortOrder: number;
};

export type CreateUrlResponse = {
  success: boolean;
  data: Url;
};

export type UpdateUrlResponse = {
  success: boolean;
  message?: string;
  data: Url;
};

export type ReorderUrlResponse = {
  success: boolean;
  message: string;
  data: Url;
};

export type GetUrlsResponse = {
  success: boolean;
  data: Url[];
  pagination?: UrlPagination;
};

export type DeleteUrlResponse = {
  success: boolean;
  message?: string;
  data: {
    id: string;
  };
};

export type ClaimUrlInput = {
  shortCode: string;
};

export type ClaimUrlResponse = {
  success: boolean;
  message?: string;
  data: Url;
};
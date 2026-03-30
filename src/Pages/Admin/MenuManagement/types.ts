export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  isAvailable: boolean;
  isActive: boolean;
  createdAt: string;
  branchId?: string;
  branch?: {
    id: string;
    name: string;
  };
};

export type MenuResponse = {
  items: MenuItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

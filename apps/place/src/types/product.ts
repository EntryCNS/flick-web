export type ProductStatus = "ACTIVE" | "SOLD_OUT" | "HIDDEN";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string | null;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  image: string;
  status?: ProductStatus;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  status?: ProductStatus;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  status: ProductStatus;
}

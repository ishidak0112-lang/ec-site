export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: string | null;
  imageUrl: string | null;
  published: boolean;
  category?: { id: string; name: string; slug: string } | null;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderItemDetail {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  product: {
    name: string
    imageUrl: string | null
  }
}

export interface OrderDetail {
  id: string
  totalAmount: number
  status: string
  packageCondition?: string
  accountingStatus?: string
  returnStatus?: string
  createdAt: string
  shippingName: string
  shippingZip: string
  shippingPrefecture?: string
  shippingCity: string
  shippingAddress: string
  items: OrderItemDetail[]
}

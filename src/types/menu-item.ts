export interface MenuItem {
  id: string
  name: string
  info: string
  imageUrl: string
  price: number
}

export interface CartItem extends MenuItem {
  quantity: number
}
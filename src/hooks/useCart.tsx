import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    } else {
      return [];
    }
  });

  const addProduct = async (productId: number) => {
    try {
      let existInCart = cart.filter((item) => item.id === productId);

      if (existInCart) {
        const index = cart.findIndex((element) => element.id === productId);
        const updatedCart = [...cart];
        updatedCart[index].amount++;

        const stocks = await api
          .get("/stocks")
          .then((res) => res.data)
          .catch((error) => error);

        const stockAmount = stocks.filter(
          (item: Stock) => item.id === productId
        );
        if (updatedCart[index].amount > stockAmount[0].amount) {
          toast.error("Quantidade solicitada fora de estoque");
        } else {
          setCart(updatedCart);
        }
      } else {
        const products = await api
          .get("/products")
          .then((res) => res.data)
          .catch((error) => error);

        const newProduct = products.filter(
          (item: Product) => item.id === productId
        );
        setCart((cart) => [...cart, newProduct[0]]);
      }

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}

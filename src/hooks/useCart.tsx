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
    }
    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const existInCart = cart.find((item) => item.id === productId);

      if (existInCart) {
        const { amount: productAmount } = existInCart;
        const { data: stocks } = await api.get<Stock>(`/stock/${productId}`);

        const isAvailableInStock = stocks.amount > productAmount;

        if (!isAvailableInStock) {
          toast.error("Quantidade solicitada fora de estoque");
          return;
        }

        const updatedAmountCartProduct = cart.map((product) => {
          return product.id === productId
            ? { ...product, amount: productAmount + 1 }
            : product;
        });

        setCart(updatedAmountCartProduct);

        localStorage.setItem(
          "@RocketShoes:cart",
          JSON.stringify(updatedAmountCartProduct)
        );

        return;
      }

      const { data: productData } = await api.get<Product>(
        `products/${productId}`
      );

      const cartWithNewProduct = [...cart, { ...productData, amount: 1 }];

      setCart(cartWithNewProduct);

      localStorage.setItem(
        "@RocketShoes:cart",
        JSON.stringify(cartWithNewProduct)
      );
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const itemExistInCart = cart.find((product) => product.id === productId);
      if (!itemExistInCart) {
        throw Error();
      }

      const updatedCart = cart.filter((product) => product.id !== productId);

      setCart(updatedCart);

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) {
        return;
      }

      const { data: stockAmount } = await api.get<Stock>(`/stock/${productId}`);

      const isUpdatePossible = amount <= stockAmount.amount;

      if (!isUpdatePossible) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      const updatedAmountCartProduct = cart.map((product) => {
        return product.id === productId
          ? { ...product, amount: amount }
          : product;
      });

      setCart(updatedAmountCartProduct);

      localStorage.setItem(
        "@RocketShoes:cart",
        JSON.stringify(updatedAmountCartProduct)
      );

      return;
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
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

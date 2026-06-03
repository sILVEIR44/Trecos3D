import React, { createContext, useState, ReactNode } from 'react';

// O molde do produto quando entra no carrinho
export interface ProdutoCarrinho {
  id: string | number;
  title: string;
  price: number;
  image_url?: string;
  quantidade: number;
}

interface CartContextData {
  carrinho: ProdutoCarrinho[];
  adicionarAoCarrinho: (produto: any) => void;
}

export const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: { children: ReactNode }) {
  const [carrinho, setCarrinho] = useState<ProdutoCarrinho[]>([]);

  function adicionarAoCarrinho(produto: any) {
    const itemExistente = carrinho.find(item => item.id === produto.id);

    if (itemExistente) {
      setCarrinho(
        carrinho.map(item =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        )
      );
      alert("Uma nova unidade foi adicionada ao seu carrinho!");
    } else {
      // Se for novo, coloca-o no baú com a quantidade 1
      setCarrinho([...carrinho, { ...produto, quantidade: 1 }]);
      alert("Novo item adicionado ao carrinho!");
    }
  }

  return (
    <CartContext.Provider value={{ carrinho, adicionarAoCarrinho }}>
      {children}
    </CartContext.Provider>
  );
}
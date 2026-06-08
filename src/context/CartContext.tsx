import React, { createContext, useState, ReactNode } from 'react';

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
  removerDoCarrinho: (id: string | number) => void;
  aumentarQuantidade: (id: string | number) => void;
  diminuirQuantidade: (id: string | number) => void;
  limparCarrinho: () => void;
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
      alert("Produto adicionado ao carrinho!");
    } else {
      setCarrinho([...carrinho, { ...produto, quantidade: 1 }]);
      alert("Produto adicionado ao carrinho!");
    }
  }

  function removerDoCarrinho(id: string | number) {
    setCarrinho(carrinho.filter(item => item.id !== id));
  }

  function aumentarQuantidade(id: string | number) {
    setCarrinho(
      carrinho.map(item =>
        item.id === id ? { ...item, quantidade: item.quantidade + 1 } : item
      )
    );
  }

  function limparCarrinho() {
    setCarrinho([])
  }

  function diminuirQuantidade(id: string | number) {
    setCarrinho(
      carrinho
        .map(item =>
          item.id === id ? { ...item, quantidade: item.quantidade - 1 } : item
        )
        .filter(item => item.quantidade > 0)
    );
  }

  function limparCarrinho() {
    setCarrinho([]);
  }

  return (
    <CartContext.Provider value={{ carrinho, adicionarAoCarrinho, removerDoCarrinho, aumentarQuantidade, diminuirQuantidade, limparCarrinho }}>
      {children}
    </CartContext.Provider>
  );
}

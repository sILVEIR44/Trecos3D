import React, { useContext } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from "react-native";
import { CartContext } from "../../context/CartContext";

export default function Carrinho() {
  const { carrinho } = useContext(CartContext);

  // soma o valor total das riquezas
  const valorTotal = carrinho.reduce((total, item) => {
    return total + (item.price * item.quantidade);
  }, 0);

  //  Como desenhar cada item do carrinho
  function renderizarItemCarrinho({ item }: any) {
    return (
      <View style={styles.cardItem}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.imagem} />
        ) : (
          <View style={styles.imagemVazia} />
        )}
        <View style={styles.infoItem}>
          <Text style={styles.tituloItem}>{item.title}</Text>
          <Text style={styles.precoItem}>R$ {item.price}</Text>
          <Text style={styles.quantidadeItem}>Qtd: {item.quantidade}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitulo}>Meu Carrinho </Text>

      {carrinho.length === 0 ? (
        <Text style={styles.textoVazio}>Seu carrinho aguarda novos itens.</Text>
      ) : (
        <>
          <FlatList
            data={carrinho}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderizarItemCarrinho}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
          <View style={styles.rodape}>
            <Text style={styles.textoTotal}>Total: R$ {valorTotal.toFixed(2)}</Text>
            <TouchableOpacity style={styles.botaoFinalizar}>
              <Text style={styles.textoBotaoFinalizar}>Finalizar Pedido</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  headerTitulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 30,
    textAlign: "center",
  },
  textoVazio: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  },
  cardItem: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: "row",
    padding: 10,
    elevation: 2,
  },
  imagem: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  imagemVazia: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#D3D3D3",
  },
  infoItem: {
    marginLeft: 15,
    justifyContent: "center",
  },
  tituloItem: {
    fontSize: 16,
    fontWeight: "bold",
  },
  precoItem: {
    fontSize: 14,
    color: "#2E8B57",
    marginTop: 2,
  },
  quantidadeItem: {
    fontSize: 14,
    color: "gray",
    marginTop: 2,
  },
  rodape: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#D3D3D3",
    alignItems: "center",
  },
  textoTotal: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  botaoFinalizar: {
    backgroundColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  textoBotaoFinalizar: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
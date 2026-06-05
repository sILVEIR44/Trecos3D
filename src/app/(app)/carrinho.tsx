import React, { useContext } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { CartContext } from "../../context/CartContext"

export default function Carrinho() {
  const { carrinho, removerDoCarrinho, aumentarQuantidade, diminuirQuantidade } =
    useContext(CartContext)

  const valorTotal = carrinho.reduce((total, item) => {
    return total + item.price * item.quantidade
  }, 0)

  function confirmarRemocao(id: string | number, titulo: string) {
    Alert.alert(
      "Remover item",
      `Deseja remover "${titulo}" do carrinho?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: () => removerDoCarrinho(id) },
      ]
    )
  }

  function renderizarItem({ item }: any) {
    return (
      <View style={styles.card}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.imagem} />
        ) : (
          <View style={styles.imagemVazia}>
            <Ionicons name="cube-outline" size={28} color="#CCC" />
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.titulo} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.preco}>R$ {Number(item.price).toFixed(2)}</Text>

          {/* Controles de quantidade */}
          <View style={styles.quantidade}>
            {item.quantidade > 1 && (
              <TouchableOpacity
                style={styles.btnQtd}
                onPress={() => diminuirQuantidade(item.id)}
              >
                <Ionicons name="remove" size={16} color="#9810FA" />
              </TouchableOpacity>
            )}

            <Text style={styles.qtdTexto}>{item.quantidade}</Text>

            <TouchableOpacity
              style={styles.btnQtd}
              onPress={() => aumentarQuantidade(item.id)}
            >
              <Ionicons name="add" size={16} color="#9810FA" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botão remover */}
        <TouchableOpacity
          style={styles.btnRemover}
          onPress={() => confirmarRemocao(item.id, item.title)}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meu Carrinho</Text>

      {carrinho.length === 0 ? (
        <View style={styles.vazio}>
          <Ionicons name="cart-outline" size={64} color="#CCC" />
          <Text style={styles.vazioTexto}>Seu carrinho está vazio.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={carrinho}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderizarItem}
            contentContainerStyle={{ paddingBottom: 160 }}
            showsVerticalScrollIndicator={false}
          />

          {/* Rodapé fixo */}
          <View style={styles.rodape}>
            <View style={styles.rodapeInfo}>
              <Text style={styles.rodapeLabel}>
                {carrinho.length} {carrinho.length === 1 ? "item" : "itens"}
              </Text>
              <Text style={styles.rodapeTotal}>R$ {valorTotal.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.botaoFinalizar}>
              <Text style={styles.botaoFinalizarTexto}>Finalizar Pedido</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 55,
    marginBottom: 16,
    color: "#222",
  },

  // Vazio
  vazio: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  vazioTexto: {
    fontSize: 16,
    color: "#888",
  },

  // Card item
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    elevation: 2,
  },
  imagem: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#EEE",
  },
  imagemVazia: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#EEE",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  titulo: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  preco: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#9810FA",
    marginBottom: 8,
  },

  // Quantidade
  quantidade: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  btnQtd: {
    borderWidth: 1,
    borderColor: "#9810FA",
    borderRadius: 6,
    padding: 4,
  },
  qtdTexto: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
    minWidth: 20,
    textAlign: "center",
  },

  // Botão remover
  btnRemover: {
    padding: 8,
    marginLeft: 8,
  },

  // Rodapé
  rodape: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    paddingBottom: 28,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    gap: 12,
  },
  rodapeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rodapeLabel: {
    fontSize: 14,
    color: "#888",
  },
  rodapeTotal: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
  botaoFinalizar: {
    backgroundColor: "#9810FA",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  botaoFinalizarTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})

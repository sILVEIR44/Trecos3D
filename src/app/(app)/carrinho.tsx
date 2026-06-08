import React, { useContext, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "expo-router";
import api from "../../services/authService";

export default function Carrinho() {
  const router = useRouter();
  const { carrinho, removerDoCarrinho, aumentarQuantidade, diminuirQuantidade, limparCarrinho } = useContext(CartContext) as any;
  const { token, user } = useContext(AuthContext) as any;
  const { colors } = useTheme();

  const [sucesso, setSucesso] = useState<string | null>(null);
  const [finalizando, setFinalizando] = useState(false);

  function confirmarRemocao(id: string | number, titulo: string) {
    Alert.alert(
      "Remover item",
      `Deseja remover "${titulo}" do carrinho?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: () => removerDoCarrinho(id) },
      ]
    );
  }

  function renderizarItem({ item }: any) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.imagem} />
        ) : (
          <View style={[styles.imagemVazia, { backgroundColor: colors.border }]}>
            <Ionicons name="cube-outline" size={28} color="#CCC" />
          </View>
        )}

        <View style={styles.info}>
          <Text style={[styles.titulo, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.preco}>R$ {Number(item.price).toFixed(2)}</Text>

          <View style={styles.quantidade}>
            {item.quantidade > 1 && (
              <TouchableOpacity style={styles.btnQtd} onPress={() => diminuirQuantidade(item.id)}>
                <Ionicons name="remove" size={16} color="#9810FA" />
              </TouchableOpacity>
            )}
            <Text style={[styles.qtdTexto, { color: colors.text }]}>{item.quantidade}</Text>
            <TouchableOpacity style={styles.btnQtd} onPress={() => aumentarQuantidade(item.id)}>
              <Ionicons name="add" size={16} color="#9810FA" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.btnRemover} onPress={() => confirmarRemocao(item.id, item.title)}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    );
  }

  const valorTotal = carrinho.reduce((total: number, item: any) => total + (item.price * item.quantidade), 0);

  const finalizarPedido = async () => {
    if (carrinho.length === 0) {
      Alert.alert("Carrinho vazio", "Adicione produtos da loja antes de finalizar.");
      return;
    }
    if (!token) {
      Alert.alert("Sessão expirada", "Faça login novamente.");
      return;
    }

    setFinalizando(true);
    const totalItens = carrinho.reduce((acc: number, item: any) => acc + item.quantidade, 0);

    const itensDoPedido = carrinho.map((item: any) => ({
      product_title: item.material_selecionado
        ? `${item.title} — Material: ${item.material_selecionado}`
        : item.title,
      quantity: item.quantidade,
      unit_price: Number(item.price),
    }));

    try {
      const resposta = await api.post("/orders", {
        total_value: valorTotal,
        item_count: totalItens,
        items: itensDoPedido,
      });

      limparCarrinho();
      setSucesso(resposta.data.message || "Pedido finalizado com sucesso!");
      setTimeout(() => {
        setSucesso(null);
        router.replace("/meus-pedidos");
      }, 2200);
    } catch (error: any) {
      Alert.alert("Erro ao finalizar", error?.response?.data?.error || "Tente novamente.");
    } finally {
      setFinalizando(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {sucesso && (
        <View style={styles.bannerSucesso}>
          <Ionicons name="checkmark-circle" size={22} color="white" />
          <Text style={styles.bannerSucessoTexto}>{sucesso}</Text>
        </View>
      )}

      <Text style={[styles.header, { color: colors.text }]}>Meu Carrinho</Text>

      {carrinho.length === 0 ? (
        <View style={[styles.vazio, { backgroundColor: colors.card }]}>
          <Ionicons name="cart-outline" size={40} color="#CCC" />
          <Text style={[styles.vazioTexto, { color: colors.subtext }]}>Nenhum item da loja adicionado.</Text>
        </View>
      ) : (
        <FlatList
          data={carrinho}
          keyExtractor={item => item.id.toString()}
          renderItem={renderizarItem}
          style={{ maxHeight: 250 }}
          showsVerticalScrollIndicator={false}
        />
      )}


      <View style={[styles.rodape, { backgroundColor: colors.card, borderTopColor: colors.divider }]}>
        <View style={styles.rodapeInfo}>
          <Text style={[styles.rodapeLabel, { color: colors.subtext }]}>Valor Total Final</Text>
          <Text style={[styles.rodapeTotal, { color: colors.text }]}>R$ {valorTotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.botaoFinalizar, finalizando && { opacity: 0.6 }]}
          onPress={finalizarPedido}
          disabled={finalizando}
        >
          {finalizando
            ? <ActivityIndicator color="white" size="small" />
            : <Text style={styles.botaoFinalizarTexto}>Finalizar Pedido</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  header: { fontSize: 22, fontWeight: "bold", marginTop: 55, marginBottom: 16 },

  bannerSucesso: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#10B981", borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 16, marginTop: 55, marginBottom: -30,
  },
  bannerSucessoTexto: { color: "white", fontWeight: "bold", fontSize: 14, flex: 1 },

  vazio: { padding: 20, alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 12 },
  vazioTexto: { fontSize: 16, fontStyle: "italic" },
  vazioTextoLista: { fontSize: 14, fontStyle: "italic", textAlign: "center", marginTop: 10 },

  card: {
    borderRadius: 12, marginBottom: 12, flexDirection: "row",
    padding: 12, alignItems: "center", elevation: 2,
  },
  imagem: { width: 70, height: 70, borderRadius: 8 },
  imagemVazia: { width: 70, height: 70, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  info: { flex: 1, marginLeft: 12 },
  titulo: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  preco: { fontSize: 15, fontWeight: "bold", color: "#9810FA", marginBottom: 8 },
  quantidade: { flexDirection: "row", alignItems: "center", gap: 10 },
  btnQtd: { borderWidth: 1, borderColor: "#9810FA", borderRadius: 6, padding: 4 },
  qtdTexto: { fontSize: 15, fontWeight: "bold", minWidth: 20, textAlign: "center" },
  btnRemover: { padding: 8, marginLeft: 8 },


  rodape: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: 16, paddingBottom: 28, elevation: 10, borderTopWidth: 1, gap: 12,
  },
  rodapeInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rodapeLabel: { fontSize: 14 },
  rodapeTotal: { fontSize: 20, fontWeight: "bold" },
  botaoFinalizar: { backgroundColor: "#9810FA", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  botaoFinalizarTexto: { color: "white", fontWeight: "bold", fontSize: 16 },
});

import React, { useContext, useState, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "expo-router";

export default function Carrinho() {
  const router = useRouter();
  const { carrinho, removerDoCarrinho, aumentarQuantidade, diminuirQuantidade, limparCarrinho } = useContext(CartContext) as any;
  const { token, user } = useContext(AuthContext) as any;
  const { colors } = useTheme();

  const [listaOrcamentos, setListaOrcamentos] = useState<any[]>([]);
  const [carregandoOrcamentos, setCarregandoOrcamentos] = useState(true);

  const buscarMeusOrcamentos = async () => {
    try {
      const urlAPI = `http://192.168.5.235:3000/orcamentos/${user?.id}`;
      const resposta = await fetch(urlAPI);
      const dados = await resposta.json();
      setListaOrcamentos(dados);
    } catch (error) {
      console.error("Erro ao buscar orçamentos:", error);
    } finally {
      setCarregandoOrcamentos(false);
    }
  };

  useEffect(() => {
    buscarMeusOrcamentos();
  }, []);

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

  const totalLoja = carrinho.reduce((total: number, item: any) => total + (item.price * item.quantidade), 0);
  const totalOrcamentos = listaOrcamentos.reduce((total: number, item: any) => total + Number(item.calculated_price), 0);
  const valorTotal = totalLoja + totalOrcamentos;

  const finalizarPedido = async () => {
    if (carrinho.length === 0 && listaOrcamentos.length === 0) {
      alert("Atenção, o seu carrinho está vazio. Adicione itens antes de finalizar.");
      return;
    }
    if (!token) {
      alert("Acesso Negado: Faça login novamente.");
      return;
    }

    const quantidadeProdutos = carrinho.reduce((acc: number, item: any) => acc + item.quantidade, 0);
    const totalItens = quantidadeProdutos + listaOrcamentos.length;

    try {
      const resposta = await fetch("http://192.168.5.235:3000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quote_id: null, total_value: valorTotal, item_count: totalItens }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        limparCarrinho();
        alert("Sucesso! O seu pedido foi enviado!\n\n" + dados.message);
        router.replace("/meus-pedidos");
      } else {
        alert("Erro: " + dados.error);
      }
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
      alert("Erro de Comunicação. Tente novamente mais tarde.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Meu Carrinho</Text>

      {/* Itens da loja */}
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

      {/* Orçamentos 3D */}
      <Text style={[styles.tituloSecao, { color: colors.text }]}>Meus Orçamentos (Peças 3D)</Text>

      {carregandoOrcamentos ? (
        <ActivityIndicator size="large" color="#9810FA" />
      ) : listaOrcamentos.length === 0 ? (
        <Text style={[styles.vazioTextoLista, { color: colors.subtext }]}>Nenhum orçamento pendente.</Text>
      ) : (
        <FlatList
          data={listaOrcamentos}
          keyExtractor={item => String(item.id)}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.cartaoOrcamento, { backgroundColor: colors.card }]}>
              <Image source={{ uri: item.file_url }} style={styles.miniatura} />
              <View style={styles.detalhesCartao}>
                <Text style={[styles.textoForte, { color: colors.text }]}>Material: {item.material}</Text>
                <Text style={[styles.textoPeso, { color: colors.subtext }]}>Peso: {item.estimated_grams}g</Text>
                <Text style={styles.textoPrecoOrcamento}>Estimativa: R$ {item.calculated_price}</Text>
                <View style={[
                  styles.insigniaStatus,
                  item.status === "pending" ? styles.statusPendente : styles.statusAprovado,
                ]}>
                  <Text style={styles.textoStatus}>
                    {item.status === "pending" ? "Em Avaliação" : "Aprovado"}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Rodapé */}
      <View style={[styles.rodape, { backgroundColor: colors.card, borderTopColor: colors.divider }]}>
        <View style={styles.rodapeInfo}>
          <Text style={[styles.rodapeLabel, { color: colors.subtext }]}>Valor Total Final</Text>
          <Text style={[styles.rodapeTotal, { color: colors.text }]}>R$ {valorTotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.botaoFinalizar} onPress={finalizarPedido}>
          <Text style={styles.botaoFinalizarTexto}>Finalizar Pedido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  header: { fontSize: 22, fontWeight: "bold", marginTop: 55, marginBottom: 16 },
  vazio: {
    padding: 20, alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 12,
  },
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

  tituloSecao: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  cartaoOrcamento: {
    flexDirection: "row", padding: 10, borderRadius: 8, marginBottom: 10, elevation: 2,
  },
  miniatura: { width: 60, height: 60, borderRadius: 8, marginRight: 10, backgroundColor: "#EEE" },
  detalhesCartao: { flex: 1, justifyContent: "center" },
  textoForte: { fontWeight: "bold", fontSize: 15 },
  textoPeso: { fontSize: 13, marginVertical: 2 },
  textoPrecoOrcamento: { color: "#2E8B57", fontWeight: "bold", marginVertical: 2 },
  insigniaStatus: { marginTop: 5, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, alignSelf: "flex-start" },
  statusPendente: { backgroundColor: "#fff3cd" },
  statusAprovado: { backgroundColor: "#d1e7dd" },
  textoStatus: { fontSize: 12, fontWeight: "bold", color: "#333" },

  rodape: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: 16, paddingBottom: 28, elevation: 10,
    borderTopWidth: 1, gap: 12,
  },
  rodapeInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rodapeLabel: { fontSize: 14 },
  rodapeTotal: { fontSize: 20, fontWeight: "bold" },
  botaoFinalizar: { backgroundColor: "#9810FA", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  botaoFinalizarTexto: { color: "white", fontWeight: "bold", fontSize: 16 },
});

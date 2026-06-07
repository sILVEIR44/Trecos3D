import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CartContext, ProdutoCarrinho } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import api from "../../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Carrinho() {
  const router = useRouter();
  const { carrinho, removerDoCarrinho, aumentarQuantidade, diminuirQuantidade, limparCarrinho } = useContext(CartContext) as any;
  const { token, user } = useContext(AuthContext) as any;
  
  const [ listaOrcamentos, setListaOrcamentos ] = useState<any[]>([]);
  const [ carregandoOrcamentos, setCarregandoOrcamentos ] = useState(true);

  // A vossa magia de buscar as peças 3D
  const buscarMeusOrcamentos = async () => {
    try {
      const response = await api.get(`/orcamentos/${user?.id}`);
      setListaOrcamentos(response.data);
    } catch (error) {
      console.error("Erro ao buscar orçamentos:", error);
    } finally {
      setCarregandoOrcamentos(false);
    }
  };

  useEffect(() => {
    buscarMeusOrcamentos();
  }, []);

  function confirmarRemocao(id: string | number) {
    Alert.alert(
      "Remover item",
      "Deseja mesmo remover?",
      [
        { text: "Não", style: "cancel" },
        { text: "Sim", style: "destructive", onPress: () => removerDoCarrinho(id) },
      ]
    );
  }

  // O cartão do item da loja (Feito pelo aliado)
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

          <View style={styles.quantidade}>
            {item.quantidade > 1 && (
              <TouchableOpacity style={styles.btnQtd} onPress={() => diminuirQuantidade(item.id)}>
                <Ionicons name="remove" size={16} color="#9810FA" />
              </TouchableOpacity>
            )}
            <Text style={styles.qtdTexto}>{item.quantidade}</Text>
            <TouchableOpacity style={styles.btnQtd} onPress={() => aumentarQuantidade(item.id)}>
              <Ionicons name="add" size={16} color="#9810FA" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.btnRemover} onPress={() => confirmarRemocao(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    );
  }

  // A matemática do Imperador: Soma Loja + Orçamentos 3D
  const totalLoja = carrinho.reduce(( total: number, item: any ) => total + ( item.price * item.quantidade ), 0);
  const totalOrcamentos = listaOrcamentos.reduce(( total: number, item: any ) => total + Number(item.calculated_price), 0);
  const valorTotal = totalLoja + totalOrcamentos;

  // A vossa rota de finalização
  const finalizarPedido = async () => {
    if (carrinho.length === 0 && listaOrcamentos.length === 0) {
      alert("Atenção, o seu carrinho está vazio. Adicione itens antes de finalizar.");
      return;
    }
    
    const token = await AsyncStorage.getItem("@Trecos3D:token");
    if (!token) {
      Alert.alert("Sessão expirada", "Por favor, faça login novamente.");
      return;
    }

    const quantidadeProdutos = carrinho.reduce((acc: number, item: any) => acc + item.quantidade, 0);
    const quantidadeOrcamentos = listaOrcamentos.length; 
    const totalItens = quantidadeProdutos + quantidadeOrcamentos;

    try {
      await api.post('/orders', {
        total_value: valorTotal,
        item_count: totalItens,
        items: carrinho.map((item: ProdutoCarrinho) => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantidade: item.quantidade,
        })),
      })

      limparCarrinho()

      Alert.alert(
        "🎉 Pedido finalizado com sucesso!",
        "Seu pedido foi recebido e está sendo preparado. Acompanhe o status em 'Meus Pedidos'.",
        [{ text: "Voltar à Loja", onPress: () => router.replace("/home") }]
      )
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error)
      Alert.alert("Erro", "Não foi possível finalizar o pedido. Tente novamente.")
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meu Carrinho</Text>

      {/* --- SEÇÃO 1: ITENS DA LOJA --- */}
      {carrinho.length === 0 ? (
        <View style={styles.vazio}>
          <Ionicons name="cart-outline" size={40} color="#CCC" />
          <Text style={styles.vazioTexto}>Nenhum item da loja adicionado.</Text>
        </View>
      ) : (
        <FlatList
          data={carrinho}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderizarItem}
          style={{ maxHeight: 250 }} 
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* --- SEÇÃO 2: ORÇAMENTOS 3D  --- */}
      <Text style={styles.tituloSecao}>Meus Orçamentos (Peças 3D)</Text>

      { carregandoOrcamentos ? (
        <ActivityIndicator size="large" color="#9810FA" />
      ) : listaOrcamentos.length === 0 ? (
        <Text style={styles.vazioTextoLista}>Nenhum orçamento pendente.</Text>
      ) : (
        <FlatList
          data={listaOrcamentos}
          keyExtractor={(item) => String(item.id)}
          style={{ flex: 1 }} 
          contentContainerStyle={{ paddingBottom: 100 }} // Espaço para não bater no rodapé flutuante
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.cartaoOrcamento}>
              <Image source={{ uri: item.file_url }} style={styles.miniatura} />
              <View style={styles.detalhesCartao}>
                <Text style={styles.textoForte}>Material: {item.material}</Text>
                <Text style={styles.textoPeso}>Peso: {item.estimated_grams}g</Text>
                <Text style={styles.textoPrecoOrcamento}>Estimativa: R$ {item.calculated_price}</Text>
                
                <View style={[styles.insigniaStatus, item.status === 'pending' ? styles.statusPendente : styles.statusAprovado]}>
                  <Text style={styles.textoStatus}>
                    {item.status === 'pending' ? 'Em Avaliação' : 'Aprovado'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* --- SEÇÃO 3: rodape --- */}
      <View style={styles.rodape}>
        <View style={styles.rodapeInfo}>
          <Text style={styles.rodapeLabel}>Valor Total Final</Text>
          <Text style={styles.rodapeTotal}>R$ {valorTotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.botaoFinalizar} onPress={finalizarPedido}>
          <Text style={styles.botaoFinalizarTexto}>Finalizar Pedido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
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
  vazio: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "white",
    borderRadius: 12,
  },
  vazioTexto: {
    fontSize: 16,
    color: "#888",
    fontStyle: 'italic',
  },
  vazioTextoLista: {
    fontSize: 14,
    color: "#888",
    fontStyle: 'italic',
    textAlign: "center",
    marginTop: 10,
  },
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
  btnRemover: {
    padding: 8,
    marginLeft: 8,
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "80%",
    alignItems: "center",
    gap: 12,
  },
  modalTitulo: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
  },
  modalTexto: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  modalBotoes: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalBotaoCancelar: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDD",
    alignItems: "center",
  },
  modalBotaoCancelarTexto: {
    color: "#555",
    fontWeight: "bold",
  },
  modalBotaoRemover: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#EF4444",
    alignItems: "center",
  },
  modalBotaoRemoverTexto: {
    color: "white",
    fontWeight: "bold",
  },
  tituloSecao: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  cartaoOrcamento: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2, 
  },
  miniatura: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  detalhesCartao: {
    flex: 1,
    justifyContent: 'center',
  },
  textoForte: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
  },
  textoPeso: {
    fontSize: 13,
    color: '#666',
    marginVertical: 2,
  },
  textoPrecoOrcamento: {
    color: '#2E8B57',
    fontWeight: 'bold',
    marginVertical: 2,
  },
  insigniaStatus: {
    marginTop: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusPendente: {
    backgroundColor: '#fff3cd', 
  },
  statusAprovado: {
    backgroundColor: '#d1e7dd', 
  },
  textoStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  }
});
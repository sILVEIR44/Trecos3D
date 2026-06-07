import { useEffect, useState } from "react"
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import api from "../../services/authService"

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)
  const [confirmandoId, setConfirmandoId] = useState<number | null>(null)

  async function buscarPedidos() {
    setCarregando(true)
    try {
      const response = await api.get("/orders")
      setPedidos(response.data)
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os pedidos.")
    } finally {
      setCarregando(false)
    }
  }

  async function marcarConcluido(id: number) {
    // Atualiza na tela imediatamente
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: "completed" } : p))
    setConfirmandoId(null)
    try {
      await api.put(`/orders/${id}/status`, { status: "completed" })
    } catch (error: any) {
      console.log("Erro ao atualizar pedido:", error?.response?.data || error?.message)
      // Reverte se der erro
      setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: "preparing" } : p))
    }
  }

  useEffect(() => {
    buscarPedidos()
  }, [])

  function renderizarPedido({ item }: any) {
    const itens = typeof item.items === "string" ? JSON.parse(item.items) : item.items || []
    const concluido = item.status === "completed"

    return (
      <View style={[styles.card, concluido && styles.cardConcluido]}>
        {/* Header do card */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.pedidoId}>Pedido #{item.id}</Text>
            <Text style={styles.pedidoData}>
              {new Date(item.created_at).toLocaleDateString("pt-BR")}
            </Text>
          </View>
          <View style={[styles.badge, concluido ? styles.badgeConcluido : styles.badgePendente]}>
            <Text style={styles.badgeTexto}>
              {concluido ? "Pronto ✓" : "Preparando"}
            </Text>
          </View>
        </View>

        {/* Dados do cliente */}
        <View style={styles.clienteBox}>
          <Ionicons name="person-outline" size={14} color="#888" />
          <Text style={styles.clienteTexto}>{item.user_name || "—"}</Text>
          <Text style={styles.clienteEmail}>{item.user_email || ""}</Text>
        </View>

        {/* Itens do pedido */}
        {itens.length > 0 && (
          <View style={styles.itensBox}>
            <Text style={styles.itensLabel}>Itens:</Text>
            {itens.map((i: any, index: number) => (
              <Text key={index} style={styles.itemTexto}>
                • {i.title} x{i.quantidade} — R$ {Number(i.price * i.quantidade).toFixed(2)}
              </Text>
            ))}
          </View>
        )}

        {/* Total e botão */}
        <Text style={styles.total}>Total: R$ {Number(item.total_value).toFixed(2)}</Text>

        {!concluido && confirmandoId !== item.id && (
          <TouchableOpacity style={styles.btnConcluir} onPress={() => setConfirmandoId(item.id)}>
            <Ionicons name="checkmark-circle-outline" size={16} color="white" />
            <Text style={styles.btnConcluirTexto}>Pronto para retirada</Text>
          </TouchableOpacity>
        )}

        {!concluido && confirmandoId === item.id && (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTexto}>Confirmar entrega?</Text>
            <View style={styles.confirmBotoes}>
              <TouchableOpacity style={styles.confirmNao} onPress={() => setConfirmandoId(null)}>
                <Text style={styles.confirmNaoTexto}>Não</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmSim} onPress={() => marcarConcluido(item.id)}>
                <Text style={styles.confirmSimTexto}>Sim</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#9810FA", "#E60076"]} style={styles.header}>
        <Text style={styles.headerTitulo}>Pedidos</Text>
        <Text style={styles.headerSub}>{pedidos.length} pedido{pedidos.length !== 1 ? "s" : ""} no total</Text>
      </LinearGradient>

      {carregando ? (
        <ActivityIndicator size="large" color="#9810FA" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderizarPedido}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.vazio}>
              <Ionicons name="receipt-outline" size={60} color="#CCC" />
              <Text style={styles.vazioTexto}>Nenhum pedido ainda.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.botaoAtualizar} onPress={buscarPedidos}>
        <Ionicons name="refresh-outline" size={18} color="#9810FA" />
        <Text style={styles.botaoAtualizarTexto}>Atualizar</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  header: { paddingTop: 55, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitulo: { color: "white", fontSize: 22, fontWeight: "bold" },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 },

  lista: { padding: 16, gap: 12, paddingBottom: 80 },

  card: { backgroundColor: "white", borderRadius: 12, padding: 16, elevation: 2 },
  cardConcluido: { opacity: 0.7 },

  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  pedidoId: { fontSize: 15, fontWeight: "bold", color: "#222" },
  pedidoData: { fontSize: 12, color: "#888", marginTop: 2 },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgePendente: { backgroundColor: "#FEF3C7" },
  badgeConcluido: { backgroundColor: "#DCFCE7" },
  badgeTexto: { fontSize: 12, fontWeight: "bold", color: "#444" },

  clienteBox: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  clienteTexto: { fontSize: 13, fontWeight: "bold", color: "#444" },
  clienteEmail: { fontSize: 12, color: "#888" },

  itensBox: { backgroundColor: "#F9F9F9", borderRadius: 8, padding: 10, marginBottom: 10 },
  itensLabel: { fontSize: 12, fontWeight: "bold", color: "#666", marginBottom: 4 },
  itemTexto: { fontSize: 13, color: "#444", marginBottom: 2 },

  cardRodape: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  total: { fontSize: 15, fontWeight: "bold", color: "#9810FA" },

  btnConcluir: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#22C55E", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginTop: 10 },
  confirmBox: { marginTop: 10, backgroundColor: "#F0FDF4", borderRadius: 10, padding: 12, gap: 10 },
  confirmTexto: { fontSize: 14, fontWeight: "bold", color: "#222", textAlign: "center" },
  confirmBotoes: { flexDirection: "row", gap: 10 },
  confirmNao: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "#DDD", alignItems: "center" },
  confirmNaoTexto: { color: "#555", fontWeight: "bold" },
  confirmSim: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: "#22C55E", alignItems: "center" },
  confirmSimTexto: { color: "white", fontWeight: "bold" },
  btnConcluirTexto: { color: "white", fontSize: 12, fontWeight: "bold" },

  vazio: { alignItems: "center", marginTop: 60, gap: 12 },
  vazioTexto: { color: "#AAA", fontSize: 15 },

  botaoAtualizar: {
    position: "absolute", bottom: 20, alignSelf: "center",
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "white", paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: "#9810FA", elevation: 3,
  },
  botaoAtualizarTexto: { color: "#9810FA", fontWeight: "bold" },
})

import { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import api from "../../services/authService"

export default function MeusPedidos() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)

  async function buscarPedidos() {
    try {
      const response = await api.get("/orders/mine")
      setPedidos(response.data)
    } catch (error) {
      console.log("Erro ao buscar pedidos:", error)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    buscarPedidos()
  }, [])

  function renderizarPedido({ item }: any) {
    const itens = typeof item.items === "string" ? JSON.parse(item.items) : item.items || []
    const concluido = item.status === "completed"

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.pedidoId}>Pedido #{item.id}</Text>
            <Text style={styles.data}>
              {new Date(item.created_at).toLocaleDateString("pt-BR")}
            </Text>
          </View>
          <View style={[styles.badge, concluido ? styles.badgeConcluido : styles.badgePendente]}>
            <Text style={styles.badgeTexto}>{concluido ? "Entregue ✓" : "Em preparo"}</Text>
          </View>
        </View>

        {itens.length > 0 && (
          <View style={styles.itensBox}>
            {itens.map((i: any, index: number) => (
              <Text key={index} style={styles.itemTexto}>
                • {i.title} x{i.quantidade}
              </Text>
            ))}
          </View>
        )}

        <Text style={styles.total}>Total: R$ {Number(item.total_value).toFixed(2)}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#9810FA", "#E60076"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.botaoVoltar}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Meus Pedidos</Text>
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
              <Text style={styles.vazioTexto}>Você ainda não fez nenhum pedido.</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  header: { paddingTop: 55, paddingBottom: 20, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 16 },
  botaoVoltar: { padding: 4 },
  headerTitulo: { color: "white", fontSize: 20, fontWeight: "bold" },

  lista: { padding: 16, gap: 12 },

  card: { backgroundColor: "white", borderRadius: 12, padding: 16, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  pedidoId: { fontSize: 15, fontWeight: "bold", color: "#222" },
  data: { fontSize: 12, color: "#888", marginTop: 2 },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgePendente: { backgroundColor: "#FEF3C7" },
  badgeConcluido: { backgroundColor: "#DCFCE7" },
  badgeTexto: { fontSize: 12, fontWeight: "bold", color: "#444" },

  itensBox: { backgroundColor: "#F9F9F9", borderRadius: 8, padding: 10, marginBottom: 10 },
  itemTexto: { fontSize: 13, color: "#444", marginBottom: 2 },

  total: { fontSize: 15, fontWeight: "bold", color: "#9810FA" },

  vazio: { alignItems: "center", marginTop: 60, gap: 12 },
  vazioTexto: { color: "#AAA", fontSize: 15, textAlign: "center" },
})

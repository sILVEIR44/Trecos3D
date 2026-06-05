import { useEffect, useState, useContext } from "react"
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import api from "../../services/authService"
import { AuthContext } from "../../context/AuthContext"

export default function Dashboard() {
  const { user } = useContext(AuthContext)
  const [dados, setDados] = useState<any>(null)
  const [carregando, setCarregando] = useState(true)

  async function buscarDashboard() {
    try {
      const response = await api.get("/dashboard")
      setDados(response.data.dashboard)
    } catch (error) {
      console.log("Erro ao buscar dashboard:", error)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    buscarDashboard()
  }, [])

  if (carregando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#9810FA" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
      {/* Header */}
      <LinearGradient colors={["#9810FA", "#E60076"]} style={styles.header}>
        <Text style={styles.headerSub}>Bem-vindo,</Text>
        <Text style={styles.headerNome}>{user?.name}</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeTexto}>{user?.role}</Text>
        </View>
      </LinearGradient>

      {/* Cards de métricas */}
      <View style={styles.cards}>
        <View style={[styles.card, { backgroundColor: "#7C3AED" }]}>
          <Ionicons name="people-outline" size={28} color="white" />
          <Text style={styles.cardValor}>—</Text>
          <Text style={styles.cardLabel}>Clientes</Text>
        </View>

        <View style={[styles.card, { backgroundColor: "#9810FA" }]}>
          <Ionicons name="cube-outline" size={28} color="white" />
          <Text style={styles.cardValor}>{dados?.total_produtos_vitrine ?? 0}</Text>
          <Text style={styles.cardLabel}>Produtos</Text>
        </View>

        <View style={[styles.card, { backgroundColor: "#E60076" }]}>
          <Ionicons name="document-text-outline" size={28} color="white" />
          <Text style={styles.cardValor}>{dados?.orcamentos_pendentes ?? 0}</Text>
          <Text style={styles.cardLabel}>Orçamentos</Text>
        </View>

        <View style={[styles.card, { backgroundColor: "#F59E0B" }]}>
          <Ionicons name="receipt-outline" size={28} color="white" />
          <Text style={styles.cardValor}>{dados?.total_pedidos ?? 0}</Text>
          <Text style={styles.cardLabel}>Pedidos</Text>
        </View>
      </View>

      {/* Receita total */}
      <View style={styles.receita}>
        <Text style={styles.receitaLabel}>Receita Total</Text>
        <Text style={styles.receitaValor}>
          R$ {Number(dados?.faturamento_total ?? 0).toFixed(2)}
        </Text>
        <Text style={styles.receitaSub}>{dados?.total_pedidos ?? 0} pedidos realizados</Text>
      </View>

      {/* Atualizar */}
      <TouchableOpacity style={styles.botaoAtualizar} onPress={buscarDashboard}>
        <Ionicons name="refresh-outline" size={18} color="#9810FA" />
        <Text style={styles.botaoAtualizarTexto}>Atualizar dados</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },

  container: { flex: 1, backgroundColor: "#F5F5F5" },
  conteudo: { paddingBottom: 40 },

  header: {
    paddingTop: 55,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  headerNome: { color: "white", fontSize: 22, fontWeight: "bold", marginTop: 2 },
  headerBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  headerBadgeTexto: { color: "white", fontSize: 12, textTransform: "capitalize" },

  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  card: {
    width: "47%",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 6,
  },
  cardValor: { color: "white", fontSize: 26, fontWeight: "bold" },
  cardLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13 },

  receita: {
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 2,
    marginBottom: 16,
  },
  receitaLabel: { fontSize: 14, color: "#888", marginBottom: 4 },
  receitaValor: { fontSize: 32, fontWeight: "bold", color: "#222" },
  receitaSub: { fontSize: 13, color: "#AAA", marginTop: 4 },

  botaoAtualizar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#9810FA",
  },
  botaoAtualizarTexto: { color: "#9810FA", fontWeight: "bold" },
})

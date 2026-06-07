import { useEffect, useState, useContext } from "react"
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import api from "../../services/authService"
import { AuthContext } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"

export default function Dashboard() {
  const { user, token } = useContext(AuthContext)
  const { colors } = useTheme()
  const [dados, setDados] = useState<any>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  async function buscarDashboard() {
    setCarregando(true)
    setErro(false)
    try {
      const response = await api.get("/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDados(response.data.dashboard)
    } catch (error) {
      setErro(true)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    if (token) buscarDashboard()
  }, [])

  if (carregando) {
    return (
      <View style={[styles.centro, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#9810FA" />
        <Text style={[styles.textoCarregando, { color: colors.subtext }]}>Carregando dados...</Text>
      </View>
    )
  }

  if (erro) {
    return (
      <View style={[styles.centro, { backgroundColor: colors.background }]}>
        <Ionicons name="cloud-offline-outline" size={60} color="#CCC" />
        <Text style={[styles.textoErro, { color: colors.text }]}>Não foi possível carregar</Text>
        <Text style={[styles.subTextoErro, { color: colors.subtext }]}>Verifique a conexão com o servidor.</Text>
        <TouchableOpacity style={styles.botaoTentar} onPress={buscarDashboard}>
          <Ionicons name="refresh-outline" size={16} color="#9810FA" />
          <Text style={styles.botaoTentarTexto}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.conteudo}
    >
      <LinearGradient colors={["#9810FA", "#E60076"]} style={styles.header}>
        <Text style={styles.headerSub}>Bem-vindo,</Text>
        <Text style={styles.headerNome}>{user?.name}</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeTexto}>{user?.role}</Text>
        </View>
      </LinearGradient>

      <View style={styles.cards}>
        <View style={[styles.card, { backgroundColor: "#9810FA" }]}>
          <Ionicons name="cube-outline" size={28} color="white" />
          <Text style={styles.cardValor}>{dados?.total_produtos_vitrine ?? 0}</Text>
          <Text style={styles.cardLabel}>Produtos</Text>
        </View>
        <View style={[styles.card, { backgroundColor: "#E60076" }]}>
          <Ionicons name="document-text-outline" size={28} color="white" />
          <Text style={styles.cardValor}>{dados?.orcamentos_pendentes ?? 0}</Text>
          <Text style={styles.cardLabel}>Pendentes</Text>
        </View>
        <View style={[styles.card, { backgroundColor: "#F59E0B" }]}>
          <Ionicons name="receipt-outline" size={28} color="white" />
          <Text style={styles.cardValor}>{dados?.total_pedidos ?? 0}</Text>
          <Text style={styles.cardLabel}>Pedidos</Text>
        </View>
        <View style={[styles.card, { backgroundColor: "#10B981" }]}>
          <Ionicons name="cash-outline" size={28} color="white" />
          <Text style={styles.cardValor}>
            {dados?.faturamento_total != null
              ? `R$${Number(dados.faturamento_total).toFixed(0)}`
              : "R$0"}
          </Text>
          <Text style={styles.cardLabel}>Receita</Text>
        </View>
      </View>

      <View style={[styles.receita, { backgroundColor: colors.card }]}>
        <Text style={[styles.receitaLabel, { color: colors.subtext }]}>Faturamento Total</Text>
        <Text style={[styles.receitaValor, { color: colors.text }]}>
          R$ {Number(dados?.faturamento_total ?? 0).toFixed(2)}
        </Text>
        <Text style={[styles.receitaSub, { color: colors.subtext }]}>
          {dados?.total_pedidos ?? 0} pedidos realizados
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.botaoAtualizar, { borderColor: "#9810FA" }]}
        onPress={buscarDashboard}
      >
        <Ionicons name="refresh-outline" size={18} color="#9810FA" />
        <Text style={styles.botaoAtualizarTexto}>Atualizar dados</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 20 },
  textoCarregando: { fontSize: 15, marginTop: 8 },
  textoErro: { fontSize: 18, fontWeight: "bold", marginTop: 8 },
  subTextoErro: { fontSize: 14 },
  botaoTentar: {
    flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12,
    borderWidth: 1, borderColor: "#9810FA", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8,
  },
  botaoTentarTexto: { color: "#9810FA", fontWeight: "bold" },

  container: { flex: 1 },
  conteudo: { paddingBottom: 40 },
  header: { paddingTop: 55, paddingBottom: 24, paddingHorizontal: 20 },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  headerNome: { color: "white", fontSize: 22, fontWeight: "bold", marginTop: 2 },
  headerBadge: {
    alignSelf: "flex-start", marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
  },
  headerBadgeTexto: { color: "white", fontSize: 12, textTransform: "capitalize" },

  cards: { flexDirection: "row", flexWrap: "wrap", padding: 16, gap: 12 },
  card: { width: "47%", borderRadius: 12, padding: 16, alignItems: "center", gap: 6 },
  cardValor: { color: "white", fontSize: 26, fontWeight: "bold" },
  cardLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13 },

  receita: {
    marginHorizontal: 16, borderRadius: 12, padding: 20,
    alignItems: "center", elevation: 2, marginBottom: 16,
  },
  receitaLabel: { fontSize: 14, marginBottom: 4 },
  receitaValor: { fontSize: 32, fontWeight: "bold" },
  receitaSub: { fontSize: 13, marginTop: 4 },

  botaoAtualizar: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, marginHorizontal: 16, paddingVertical: 12,
    borderRadius: 10, borderWidth: 1,
  },
  botaoAtualizarTexto: { color: "#9810FA", fontWeight: "bold" },
})

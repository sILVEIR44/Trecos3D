import { useEffect, useState, useContext } from "react"
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TouchableOpacity,
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AuthContext } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import api from "../../services/authService"

type Pedido = {
  id: number
  total_value: number
  item_count: number
  status: string
  created_at: string
}

const STATUS_LABELS: Record<string, { texto: string; cor: string }> = {
  preparing: { texto: "Em Produção", cor: "#F59E0B" },
  completed:  { texto: "Concluído",   cor: "#10B981" },
  cancelled:  { texto: "Cancelado",   cor: "#EF4444" },
  pending:    { texto: "Pendente",    cor: "#6B7280" },
}

function formatarData(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export default function MeusPedidos() {
  const { token } = useContext(AuthContext) as any
  const { colors } = useTheme()
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  async function buscarPedidos() {
    setCarregando(true)
    setErro(false)
    try {
      const response = await api.get("/orders/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPedidos(response.data)
    } catch (error) {
      console.log("Erro ao buscar pedidos:", error)
      setErro(true)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    if (token) buscarPedidos()
  }, [])

  if (carregando) {
    return (
      <View style={[styles.centro, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#9810FA" />
        <Text style={[styles.textoCarregando, { color: colors.subtext }]}>Carregando seus pedidos...</Text>
      </View>
    )
  }

  if (erro) {
    return (
      <View style={[styles.centro, { backgroundColor: colors.background }]}>
        <Ionicons name="cloud-offline-outline" size={60} color="#CCC" />
        <Text style={[styles.textoErro, { color: colors.text }]}>Não foi possível carregar</Text>
        <Text style={[styles.subTexto, { color: colors.subtext }]}>Verifique a conexão com o servidor.</Text>
        <TouchableOpacity style={styles.botaoTentar} onPress={buscarPedidos}>
          <Ionicons name="refresh-outline" size={16} color="#9810FA" />
          <Text style={styles.botaoTentarTexto}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Meus Pedidos</Text>
        <Text style={styles.subtitulo}>
          {pedidos.length === 0 ? "Nenhum pedido ainda" : `${pedidos.length} pedido(s)`}
        </Text>
      </View>

      <FlatList
        data={pedidos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Ionicons name="receipt-outline" size={70} color="#DDD" />
            <Text style={[styles.textoVazio, { color: colors.text }]}>Você ainda não fez nenhum pedido</Text>
            <Text style={[styles.subTexto, { color: colors.subtext }]}>Explore a loja e adicione itens ao carrinho!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = STATUS_LABELS[item.status] ?? { texto: item.status, cor: "#6B7280" }
          return (
            <TouchableOpacity
              style={[styles.cartao, { backgroundColor: colors.card }]}
              onPress={() => router.push({ pathname: "/detalhes-pedido", params: { id: item.id } })}
              activeOpacity={0.75}
            >
              <View style={styles.cartaoTopo}>
                <View style={styles.idBox}>
                  <Text style={[styles.idLabel, { color: colors.subtext }]}>Pedido</Text>
                  <Text style={[styles.idValor, { color: colors.text }]}>#{item.id}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: status.cor + "22" }]}>
                  <Text style={[styles.badgeTexto, { color: status.cor }]}>{status.texto}</Text>
                </View>
              </View>

              <View style={[styles.divisor, { backgroundColor: colors.divider }]} />

              <View style={styles.cartaoInfo}>
                <View style={styles.infoLinha}>
                  <Ionicons name="calendar-outline" size={15} color={colors.subtext} />
                  <Text style={[styles.infoTexto, { color: colors.subtext }]}>{formatarData(item.created_at)}</Text>
                </View>
                <View style={styles.infoLinha}>
                  <Ionicons name="cube-outline" size={15} color={colors.subtext} />
                  <Text style={[styles.infoTexto, { color: colors.subtext }]}>{item.item_count} item(s)</Text>
                </View>
              </View>

              <View style={styles.cartaoRodape}>
                <Text style={styles.totalValor}>R$ {Number(item.total_value).toFixed(2)}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.border} />
              </View>
            </TouchableOpacity>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 20 },
  textoCarregando: { fontSize: 15, marginTop: 8 },
  textoErro: { fontSize: 17, fontWeight: "bold", marginTop: 8 },
  subTexto: { fontSize: 14, textAlign: "center" },
  botaoTentar: {
    flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12,
    borderWidth: 1, borderColor: "#9810FA", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8,
  },
  botaoTentarTexto: { color: "#9810FA", fontWeight: "bold" },

  container: { flex: 1 },
  header: {
    backgroundColor: "#9810FA", paddingTop: 55, paddingBottom: 20, paddingHorizontal: 20,
  },
  titulo: { color: "white", fontSize: 22, fontWeight: "bold" },
  subtitulo: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 4 },

  lista: { padding: 16, gap: 12, flexGrow: 1 },
  vazio: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 10 },
  textoVazio: { fontSize: 16, fontWeight: "bold", textAlign: "center" },

  cartao: { borderRadius: 12, padding: 16, elevation: 2 },
  cartaoTopo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  idBox: {},
  idLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1 },
  idValor: { fontSize: 18, fontWeight: "bold" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeTexto: { fontSize: 13, fontWeight: "bold" },
  divisor: { height: 1, marginVertical: 12 },
  cartaoInfo: { gap: 6, marginBottom: 12 },
  infoLinha: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoTexto: { fontSize: 14 },
  cartaoRodape: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalValor: { fontSize: 22, fontWeight: "bold", color: "#9810FA" },
})

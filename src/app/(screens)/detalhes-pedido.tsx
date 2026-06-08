import { useEffect, useState, useContext } from "react"
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AuthContext } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import api from "../../services/authService"

type OrderItem = {
  id: number
  product_title: string
  quantity: number
  unit_price: number
}

type Pedido = {
  id: number
  user_id: number
  quote_id: number | null
  total_value: number
  item_count: number
  status: string
  created_at: string
  items: OrderItem[]
}

const STATUS_INFO: Record<string, { texto: string; cor: string; icone: keyof typeof Ionicons.glyphMap }> = {
  pending:   { texto: "Pendente",    cor: "#6B7280", icone: "time-outline" },
  preparing: { texto: "Em Produção", cor: "#F59E0B", icone: "construct-outline" },
  completed: { texto: "Concluído",   cor: "#10B981", icone: "checkmark-circle-outline" },
  cancelled: { texto: "Cancelado",   cor: "#EF4444", icone: "close-circle-outline" },
}

const TIMELINE = ["pending", "preparing", "completed"]

function formatarData(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

export default function DetalhesPedido() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { token } = useContext(AuthContext) as any
  const { colors } = useTheme()
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  async function buscarPedido() {
    setCarregando(true)
    setErro(false)
    try {
      const response = await api.get(`/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setPedido(response.data)
    } catch {
      setErro(true)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    if (id && token) buscarPedido()
  }, [id])

  if (carregando) {
    return (
      <View style={[styles.centro, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#9810FA" />
      </View>
    )
  }

  if (erro || !pedido) {
    return (
      <View style={[styles.centro, { backgroundColor: colors.background }]}>
        <Ionicons name="cloud-offline-outline" size={60} color="#CCC" />
        <Text style={[styles.erroTexto, { color: colors.text }]}>Pedido não encontrado</Text>
        <TouchableOpacity style={styles.btnVoltarErro} onPress={() => router.back()}>
          <Text style={styles.btnVoltarErroTexto}>Voltar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const statusAtual = pedido.status
  const info = STATUS_INFO[statusAtual] ?? { texto: statusAtual, cor: "#6B7280", icone: "ellipse-outline" as any }
  const isCancelled = statusAtual === "cancelled"
  const statusIdx = TIMELINE.indexOf(statusAtual)

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnVoltar}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Detalhes do Pedido</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.idRow}>
          <View>
            <Text style={[styles.labelCinza, { color: colors.subtext }]}>Número do Pedido</Text>
            <Text style={[styles.idValor, { color: colors.text }]}>#{(pedido as any).user_order_number ?? pedido.id}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: info.cor + "22" }]}>
            <Ionicons name={info.icone} size={15} color={info.cor} />
            <Text style={[styles.badgeTexto, { color: info.cor }]}>{info.texto}</Text>
          </View>
        </View>
        <View style={[styles.divisor, { backgroundColor: colors.divider }]} />
        <Text style={[styles.labelCinza, { color: colors.subtext }]}>Data do Pedido</Text>
        <Text style={[styles.dataValor, { color: colors.text }]}>{formatarData(pedido.created_at)}</Text>
      </View>

      {!isCancelled && (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.secaoTitulo, { color: colors.text }]}>Progresso</Text>
          <View style={styles.timeline}>
            {TIMELINE.map((st, idx) => {
              const si = STATUS_INFO[st]
              const ativo = idx <= statusIdx
              return (
                <View key={st} style={styles.timelineItem}>
                  {idx < TIMELINE.length - 1 && (
                    <View
                      style={[
                        styles.timelineLinha,
                        { backgroundColor: idx < statusIdx ? "#9810FA" : colors.border },
                      ]}
                    />
                  )}
                  <View
                    style={[
                      styles.timelinePonto,
                      ativo
                        ? { backgroundColor: "#9810FA", borderColor: "#9810FA" }
                        : { backgroundColor: colors.background, borderColor: colors.border },
                    ]}
                  >
                    {ativo && <Ionicons name={si.icone} size={13} color="white" />}
                  </View>
                  <Text style={[styles.timelineTexto, { color: ativo ? colors.text : colors.subtext }]}>
                    {si.texto}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>
      )}

      {isCancelled && (
        <View style={[styles.card, styles.cardCancelado]}>
          <Ionicons name="close-circle" size={26} color="#EF4444" />
          <Text style={styles.canceladoTexto}>Este pedido foi cancelado.</Text>
        </View>
      )}

      {pedido.items && pedido.items.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.secaoTitulo, { color: colors.text }]}>Itens do Pedido</Text>
          {pedido.items.map((item, idx) => (
            <View key={item.id}>
              {idx > 0 && <View style={[styles.divisor, { backgroundColor: colors.divider }]} />}
              <View style={styles.itemLinha}>
                <View style={styles.itemEsquerda}>
                  <Text style={[styles.itemNome, { color: colors.text }]} numberOfLines={2}>
                    {item.product_title}
                  </Text>
                  <Text style={[styles.itemQtd, { color: colors.subtext }]}>
                    {item.quantity}x · R$ {Number(item.unit_price).toFixed(2)} cada
                  </Text>
                </View>
                <Text style={[styles.itemTotal, { color: colors.text }]}>
                  R$ {(item.quantity * Number(item.unit_price)).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.secaoTitulo, { color: colors.text }]}>Resumo</Text>

        <View style={styles.resumoLinha}>
          <Text style={[styles.resumoLabel, { color: colors.subtext }]}>Quantidade de Itens</Text>
          <Text style={[styles.resumoValor, { color: colors.text }]}>{pedido.item_count} item(s)</Text>
        </View>

        <View style={[styles.divisor, { backgroundColor: colors.divider }]} />

        <View style={styles.resumoLinha}>
          <Text style={[styles.resumoLabel, { color: colors.subtext }]}>Total Pago</Text>
          <Text style={styles.totalValor}>R$ {Number(pedido.total_value).toFixed(2)}</Text>
        </View>

        {pedido.item_count >= 10 && (
          <View style={styles.descontoBadge}>
            <Ionicons name="pricetag-outline" size={14} color="#10B981" />
            <Text style={styles.descontoTexto}>Desconto de 10% aplicado (10+ itens)</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 20 },
  erroTexto: { fontSize: 17, fontWeight: "bold", marginTop: 8 },
  btnVoltarErro: {
    backgroundColor: "#9810FA", paddingHorizontal: 24,
    paddingVertical: 10, borderRadius: 8, marginTop: 8,
  },
  btnVoltarErroTexto: { color: "white", fontWeight: "bold" },

  header: {
    backgroundColor: "#9810FA", paddingTop: 55, paddingBottom: 20,
    paddingHorizontal: 16, flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
  },
  btnVoltar: { padding: 4 },
  headerTitulo: { color: "white", fontSize: 18, fontWeight: "bold" },

  card: { borderRadius: 14, marginHorizontal: 16, marginTop: 16, padding: 16, elevation: 1 },

  idRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  labelCinza: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  idValor: { fontSize: 28, fontWeight: "bold" },
  badge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  badgeTexto: { fontWeight: "bold", fontSize: 13 },
  divisor: { height: 1, marginVertical: 14 },
  dataValor: { fontSize: 15 },

  secaoTitulo: { fontSize: 15, fontWeight: "bold", marginBottom: 20 },

  timeline: { flexDirection: "row", justifyContent: "space-between" },
  timelineItem: { flex: 1, alignItems: "center", position: "relative" },
  timelineLinha: {
    position: "absolute", top: 15, left: "50%", right: "-50%",
    height: 2, zIndex: 0,
  },
  timelinePonto: {
    width: 30, height: 30, borderRadius: 15, borderWidth: 2,
    alignItems: "center", justifyContent: "center", marginBottom: 6, zIndex: 1,
  },
  timelineTexto: { fontSize: 11, textAlign: "center" },

  cardCancelado: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#FEE2E2",
  },
  canceladoTexto: { color: "#EF4444", fontWeight: "bold", fontSize: 15 },

  itemLinha: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, gap: 8 },
  itemEsquerda: { flex: 1 },
  itemNome: { fontSize: 14, fontWeight: "bold", marginBottom: 2 },
  itemQtd: { fontSize: 12 },
  itemTotal: { fontSize: 14, fontWeight: "bold" },

  resumoLinha: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  resumoLabel: { fontSize: 14 },
  resumoValor: { fontSize: 14, fontWeight: "bold" },
  totalValor: { fontSize: 20, fontWeight: "bold", color: "#9810FA" },
  descontoBadge: {
    flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12,
    backgroundColor: "#D1FAE5", padding: 10, borderRadius: 8,
  },
  descontoTexto: { color: "#10B981", fontSize: 13, fontWeight: "bold" },
})

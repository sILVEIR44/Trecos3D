import { useEffect, useState } from "react"
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, ActivityIndicator, Alert,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import api from "../../services/authService"

export default function DetalhesOrcamento() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const [orcamento, setOrcamento] = useState<any>(null)
  const [carregando, setCarregando] = useState(true)
  const [processando, setProcessando] = useState(false)

  async function buscarOrcamento() {
    try {
      const response = await api.get(`/admin/orcamentos/${id}`)
      setOrcamento(response.data)
    } catch {
      Alert.alert("Erro", "Não foi possível carregar o orçamento.")
      router.back()
    } finally {
      setCarregando(false)
    }
  }

  async function despachar(status: "approved" | "rejected") {
    const acao = status === "approved" ? "aprovar" : "rejeitar"
    Alert.alert(
      status === "approved" ? "Aprovar Orçamento" : "Rejeitar Orçamento",
      `Deseja mesmo ${acao} este orçamento?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: status === "approved" ? "Aprovar" : "Rejeitar",
          style: status === "approved" ? "default" : "destructive",
          onPress: async () => {
            setProcessando(true)
            try {
              await api.put(`/quotes/${id}/status`, { status })
              Alert.alert(
                "Sucesso!",
                `Orçamento ${status === "approved" ? "aprovado" : "rejeitado"} com sucesso.`,
                [{ text: "OK", onPress: () => router.back() }]
              )
            } catch {
              Alert.alert("Erro", "Não foi possível executar a ação.")
            } finally {
              setProcessando(false)
            }
          },
        },
      ]
    )
  }

  useEffect(() => {
    if (id) buscarOrcamento()
  }, [id])

  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#9810FA" />
      </View>
    )
  }

  if (!orcamento) return null

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnVoltar}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Detalhes do Orçamento</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.conteudo}>

        {/* Foto da peça */}
        {orcamento.file_url ? (
          <Image source={{ uri: orcamento.file_url }} style={styles.imagem} />
        ) : (
          <View style={styles.imagemVazia}>
            <Ionicons name="image-outline" size={60} color="#CCC" />
            <Text style={styles.imagemVaziaTexto}>Sem foto</Text>
          </View>
        )}

        {/* Dados do cliente */}
        <View style={styles.card}>
          <Text style={styles.secaoTitulo}>Cliente</Text>
          <View style={styles.linha}>
            <Ionicons name="person-outline" size={16} color="#9810FA" />
            <Text style={styles.linhaTexto}>{orcamento.user_name || "—"}</Text>
          </View>
          <View style={styles.linha}>
            <Ionicons name="mail-outline" size={16} color="#9810FA" />
            <Text style={styles.linhaTexto}>{orcamento.user_email || "—"}</Text>
          </View>
          {orcamento.phone ? (
            <View style={styles.linha}>
              <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
              <Text style={styles.linhaTexto}>{orcamento.phone}</Text>
            </View>
          ) : null}
        </View>

        {/* Detalhes da peça */}
        <View style={styles.card}>
          <Text style={styles.secaoTitulo}>Detalhes da Peça</Text>
          <View style={styles.linha}>
            <Ionicons name="cube-outline" size={16} color="#9810FA" />
            <Text style={styles.linhaLabel}>Material:</Text>
            <Text style={styles.linhaTexto}>{orcamento.material || "—"}</Text>
          </View>
          {orcamento.tamanho ? (
            <View style={styles.linha}>
              <Ionicons name="resize-outline" size={16} color="#9810FA" />
              <Text style={styles.linhaLabel}>Tamanho:</Text>
              <Text style={styles.linhaTexto}>{orcamento.tamanho}</Text>
            </View>
          ) : null}
          <View style={styles.linha}>
            <Ionicons name="scale-outline" size={16} color="#9810FA" />
            <Text style={styles.linhaLabel}>Peso estimado:</Text>
            <Text style={styles.linhaTexto}>{orcamento.estimated_grams}g</Text>
          </View>
          <View style={[styles.linha, { marginTop: 10 }]}>
            <Text style={styles.precoLabel}>Estimativa:</Text>
            <Text style={styles.precoValor}>
              R$ {Number(orcamento.calculated_price).toFixed(2)}
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Botões de ação */}
      {orcamento.status === "pending" && (
        <View style={styles.rodape}>
          <TouchableOpacity
            style={[styles.btn, styles.btnRejeitar, processando && { opacity: 0.6 }]}
            onPress={() => despachar("rejected")}
            disabled={processando}
          >
            <Ionicons name="close-circle-outline" size={20} color="white" />
            <Text style={styles.btnTexto}>Rejeitar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnAprovar, processando && { opacity: 0.6 }]}
            onPress={() => despachar("approved")}
            disabled={processando}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="white" />
            <Text style={styles.btnTexto}>Aprovar</Text>
          </TouchableOpacity>
        </View>
      )}

      {orcamento.status !== "pending" && (
        <View style={[styles.rodape, { justifyContent: "center" }]}>
          <View style={[
            styles.badgeStatus,
            { backgroundColor: orcamento.status === "approved" ? "#DCFCE7" : "#FEE2E2" }
          ]}>
            <Ionicons
              name={orcamento.status === "approved" ? "checkmark-circle" : "close-circle"}
              size={18}
              color={orcamento.status === "approved" ? "#16A34A" : "#DC2626"}
            />
            <Text style={[
              styles.badgeStatusTexto,
              { color: orcamento.status === "approved" ? "#16A34A" : "#DC2626" }
            ]}>
              {orcamento.status === "approved" ? "Orçamento Aprovado" : "Orçamento Rejeitado"}
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  centro: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    backgroundColor: "#9810FA", paddingTop: 55, paddingBottom: 20,
    paddingHorizontal: 16, flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
  },
  btnVoltar: { padding: 4 },
  headerTitulo: { color: "white", fontSize: 18, fontWeight: "bold" },

  conteudo: { padding: 16, paddingBottom: 120 },

  imagem: { width: "100%", height: 220, borderRadius: 14, marginBottom: 16, backgroundColor: "#EEE" },
  imagemVazia: {
    width: "100%", height: 180, borderRadius: 14, backgroundColor: "#EEE",
    alignItems: "center", justifyContent: "center", marginBottom: 16, gap: 8,
  },
  imagemVaziaTexto: { color: "#AAA", fontSize: 14 },

  card: {
    backgroundColor: "white", borderRadius: 14, padding: 16,
    marginBottom: 14, elevation: 1, gap: 10,
  },
  secaoTitulo: { fontSize: 13, fontWeight: "bold", color: "#888", textTransform: "uppercase", letterSpacing: 0.8 },

  linha: { flexDirection: "row", alignItems: "center", gap: 8 },
  linhaLabel: { fontSize: 14, color: "#888" },
  linhaTexto: { fontSize: 14, color: "#222", fontWeight: "500", flex: 1 },

  precoLabel: { fontSize: 14, color: "#888", flex: 1 },
  precoValor: { fontSize: 22, fontWeight: "bold", color: "#9810FA" },

  rodape: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "white", flexDirection: "row", gap: 12,
    padding: 16, paddingBottom: 28, borderTopWidth: 1, borderTopColor: "#EEE", elevation: 10,
  },
  btn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 14, borderRadius: 12, gap: 8,
  },
  btnRejeitar: { backgroundColor: "#DC2626" },
  btnAprovar: { backgroundColor: "#16A34A" },
  btnTexto: { color: "white", fontWeight: "bold", fontSize: 15 },

  badgeStatus: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,
  },
  badgeStatusTexto: { fontWeight: "bold", fontSize: 15 },
})

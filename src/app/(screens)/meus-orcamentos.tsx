import { useEffect, useState, useContext } from "react"
import {
  View, Text, StyleSheet, FlatList, Image,
  TouchableOpacity, ActivityIndicator, Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { AuthContext } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import api from "../../services/authService"

export default function MeusOrcamentos() {
  const { user } = useContext(AuthContext) as any
  const { colors } = useTheme()
  const router = useRouter()

  const [orcamentos, setOrcamentos] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)

  async function buscar() {
    setCarregando(true)
    try {
      const resposta = await api.get(`/orcamentos/${user?.id}`)
      setOrcamentos(resposta.data.filter((o: any) => o.status !== "ordered"))
    } catch {
      Alert.alert("Erro", "Não foi possível carregar seus orçamentos.")
    } finally {
      setCarregando(false)
    }
  }

  async function remover(id: number) {
    Alert.alert(
      "Remover orçamento",
      "Deseja cancelar este orçamento? Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/quotes/${id}`)
              setOrcamentos(prev => prev.filter(o => o.id !== id))
            } catch {
              Alert.alert("Erro", "Não foi possível remover o orçamento.")
            }
          },
        },
      ]
    )
  }

  useEffect(() => { buscar() }, [])

  function badgeStatus(status: string) {
    if (status === "approved") return { label: "✓ Aprovado", bg: "#d1e7dd", color: "#146c43" }
    if (status === "rejected") return { label: "✗ Rejeitado", bg: "#f8d7da", color: "#842029" }
    return { label: "Em Avaliação", bg: "#fff3cd", color: "#664d03" }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnVoltar}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Meus Orçamentos</Text>
        <TouchableOpacity onPress={buscar} style={styles.btnVoltar}>
          <Ionicons name="refresh-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color="#9810FA" />
        </View>
      ) : orcamentos.length === 0 ? (
        <View style={styles.centro}>
          <Ionicons name="cube-outline" size={60} color="#CCC" />
          <Text style={[styles.vazioTexto, { color: colors.text }]}>Nenhum orçamento ainda.</Text>
          <Text style={[styles.vazioSub, { color: colors.subtext }]}>
            Solicite um orçamento pela tela inicial.
          </Text>
        </View>
      ) : (
        <FlatList
          data={orcamentos}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const badge = badgeStatus(item.status)
            return (
              <View style={[styles.cartao, { backgroundColor: colors.card }]}>
                {item.file_url ? (
                  <Image source={{ uri: item.file_url }} style={styles.imagem} />
                ) : (
                  <View style={[styles.imagem, styles.imagemVazia, { backgroundColor: colors.border }]}>
                    <Ionicons name="cube-outline" size={28} color="#CCC" />
                  </View>
                )}

                <View style={styles.info}>
                  <Text style={[styles.material, { color: colors.text }]}>Material: {item.material}</Text>
                  {item.tamanho ? (
                    <Text style={[styles.detalhe, { color: colors.subtext }]}>Tamanho: {item.tamanho}</Text>
                  ) : null}
                  <Text style={[styles.detalhe, { color: colors.subtext }]}>Peso: {item.estimated_grams}g</Text>
                  <Text style={styles.preco}>R$ {Number(item.calculated_price).toFixed(2)}</Text>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeTexto, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                </View>

                {item.status === "pending" && (
                  <TouchableOpacity style={styles.btnLixeira} onPress={() => remover(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            )
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  vazioTexto: { fontSize: 17, fontWeight: "bold" },
  vazioSub: { fontSize: 14, textAlign: "center", paddingHorizontal: 32 },

  header: {
    backgroundColor: "#9810FA",
    paddingTop: 55, paddingBottom: 20, paddingHorizontal: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  btnVoltar: { padding: 4 },
  headerTitulo: { color: "white", fontSize: 18, fontWeight: "bold" },

  lista: { padding: 16, gap: 12, paddingBottom: 40 },

  cartao: {
    flexDirection: "row", borderRadius: 14, padding: 12,
    alignItems: "center", elevation: 2, gap: 12,
  },
  imagem: { width: 72, height: 72, borderRadius: 10, backgroundColor: "#EEE" },
  imagemVazia: { alignItems: "center", justifyContent: "center" },
  info: { flex: 1, gap: 3 },
  material: { fontSize: 15, fontWeight: "bold" },
  detalhe: { fontSize: 13 },
  preco: { fontSize: 16, fontWeight: "bold", color: "#9810FA", marginTop: 2 },
  badge: {
    marginTop: 4, paddingVertical: 3, paddingHorizontal: 10,
    borderRadius: 12, alignSelf: "flex-start",
  },
  badgeTexto: { fontSize: 12, fontWeight: "bold" },
  btnLixeira: { padding: 8 },
})

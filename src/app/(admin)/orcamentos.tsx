import { useEffect, useState, useContext } from "react"
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TouchableOpacity, Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { AuthContext } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import api from "../../services/authService"

export default function Orcamentos() {
  const { token } = useContext(AuthContext)
  const { colors } = useTheme()
  const router = useRouter()
  const [orcamentos, setOrcamentos] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  async function buscarOrcamentos() {
    setCarregando(true)
    setErro(false)
    try {
      const response = await api.get("/admin/orcamentos")
      setOrcamentos(response.data)
    } catch {
      setErro(true)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    if (token) buscarOrcamentos()
  }, [])

  if (carregando) {
    return (
      <View style={[styles.centro, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#E60076" />
        <Text style={[styles.textoCarregando, { color: colors.subtext }]}>Buscando orçamentos...</Text>
      </View>
    )
  }

  if (erro) {
    return (
      <View style={[styles.centro, { backgroundColor: colors.background }]}>
        <Ionicons name="cloud-offline-outline" size={60} color="#CCC" />
        <Text style={[styles.textoErro, { color: colors.text }]}>Falha ao buscar orçamentos</Text>
        <Text style={[styles.subTextoErro, { color: colors.subtext }]}>Verifique a conexão com o servidor.</Text>
        <TouchableOpacity style={styles.botaoTentar} onPress={buscarOrcamentos}>
          <Ionicons name="refresh-outline" size={16} color="#E60076" />
          <Text style={[styles.botaoTentarTexto, { color: "#E60076" }]}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Orçamentos</Text>
        <Text style={styles.subtitulo}>
          {orcamentos.length === 0
            ? "Nenhum orçamento"
            : `${orcamentos.filter((o: any) => o.status === "pending").length} pendente(s) · ${orcamentos.length} total`}
        </Text>
      </View>

      {orcamentos.length === 0 ? (
        <View style={styles.centro}>
          <Ionicons name="checkmark-done-circle-outline" size={60} color="#10B981" />
          <Text style={[styles.textoVazio, { color: colors.text }]}>Nenhum orçamento ainda.</Text>
        </View>
      ) : (
        <FlatList
          data={orcamentos}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.cartao, { backgroundColor: colors.card }]}
              onPress={() => router.push({ pathname: "/(screens)/detalhes-orcamento" as any, params: { id: item.id } })}
              activeOpacity={0.75}
            >
              <View style={styles.cartaoTopo}>
                {item.file_url ? (
                  <Image source={{ uri: item.file_url }} style={styles.imagem} />
                ) : (
                  <View style={[styles.imagem, styles.imagemVazia]}>
                    <Ionicons name="image-outline" size={28} color="#CCC" />
                  </View>
                )}

                <View style={styles.info}>
                  <Text style={[styles.infoNome, { color: colors.text }]} numberOfLines={1}>
                    {item.user_name || `Usuário #${item.user_id}`}
                  </Text>
                  <View style={styles.infoLinha}>
                    <Ionicons name="cube-outline" size={13} color="#9810FA" />
                    <Text style={[styles.infoTexto, { color: colors.subtext }]}>{item.material}</Text>
                  </View>
                  {item.tamanho ? (
                    <View style={styles.infoLinha}>
                      <Ionicons name="resize-outline" size={13} color="#9810FA" />
                      <Text style={[styles.infoTexto, { color: colors.subtext }]}>{item.tamanho}</Text>
                    </View>
                  ) : null}
                  {item.phone ? (
                    <View style={styles.infoLinha}>
                      <Ionicons name="logo-whatsapp" size={13} color="#25D366" />
                      <Text style={[styles.infoTexto, { color: colors.subtext }]}>{item.phone}</Text>
                    </View>
                  ) : null}
                  <Text style={styles.preco}>R$ {Number(item.calculated_price).toFixed(2)}</Text>
                </View>

                {item.status === "approved" && (
                  <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
                )}
                {item.status === "rejected" && (
                  <Ionicons name="close-circle" size={22} color="#DC2626" />
                )}
                {item.status === "pending" && (
                  <Ionicons name="chevron-forward" size={20} color={colors.subtext} />
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.botaoAtualizar} onPress={buscarOrcamentos}>
        <Ionicons name="refresh-outline" size={18} color="#9810FA" />
        <Text style={styles.botaoAtualizarTexto}>Atualizar</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 20 },
  textoCarregando: { fontSize: 15, marginTop: 8 },
  textoErro: { fontSize: 18, fontWeight: "bold", marginTop: 8 },
  textoVazio: { fontSize: 18, fontWeight: "bold", marginTop: 8 },
  subTextoErro: { fontSize: 14 },
  botaoTentar: {
    flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12,
    borderWidth: 1, borderColor: "#E60076", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8,
  },
  botaoTentarTexto: { fontWeight: "bold" },

  container: { flex: 1 },
  header: { backgroundColor: "#E60076", paddingTop: 55, paddingBottom: 20, paddingHorizontal: 20 },
  titulo: { color: "white", fontSize: 22, fontWeight: "bold" },
  subtitulo: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 4 },
  lista: { padding: 16, gap: 12, paddingBottom: 80 },

  cartao: { borderRadius: 14, padding: 14, elevation: 2 },
  cartaoTopo: { flexDirection: "row", alignItems: "center", gap: 12 },
  imagem: { width: 72, height: 72, borderRadius: 10, backgroundColor: "#EEE" },
  imagemVazia: { alignItems: "center", justifyContent: "center" },
  info: { flex: 1, gap: 4 },
  infoNome: { fontSize: 15, fontWeight: "bold", marginBottom: 2 },
  infoLinha: { flexDirection: "row", alignItems: "center", gap: 5 },
  infoTexto: { fontSize: 13 },
  preco: { fontSize: 16, fontWeight: "bold", color: "#9810FA", marginTop: 4 },

  botaoAtualizar: {
    position: "absolute", bottom: 20, alignSelf: "center",
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "white", paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: "#9810FA", elevation: 3,
  },
  botaoAtualizarTexto: { color: "#9810FA", fontWeight: "bold" },
})

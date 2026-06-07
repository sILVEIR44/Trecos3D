import { useEffect, useState, useContext } from "react"
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, TouchableOpacity, Image, Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AuthContext } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import api from "../../services/authService"

export default function Orcamentos() {
  const { token } = useContext(AuthContext)
  const { colors } = useTheme()
  const [orcamentos, setOrcamentos] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  async function buscarOrcamentos() {
    setCarregando(true)
    setErro(false)
    try {
      const response = await api.get("/admin/orcamentos", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setOrcamentos(response.data)
    } catch (error: any) {
      console.log("Erro ao buscar orçamentos — status:", error?.response?.status)
      console.log("Erro ao buscar orçamentos — body:", JSON.stringify(error?.response?.data))
      setErro(true)
    } finally {
      setCarregando(false)
    }
  }

  async function despacharOrdem(id: number, status: "approved" | "rejected") {
    try {
      await api.put(
        `/quotes/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      Alert.alert(
        "Sucesso!",
        `Orçamento ${status === "approved" ? "aprovado" : "rejeitado"} com sucesso.`
      )
      setOrcamentos(lista => lista.filter(item => item.id !== id))
    } catch {
      Alert.alert("Erro", "Não foi possível executar a ação.")
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
          {orcamentos.length === 0 ? "Nenhum pendente" : `${orcamentos.length} pendente(s)`}
        </Text>
      </View>

      {orcamentos.length === 0 ? (
        <View style={styles.centro}>
          <Ionicons name="checkmark-done-circle-outline" size={60} color="#10B981" />
          <Text style={[styles.textoVazio, { color: colors.text }]}>Tudo em dia!</Text>
          <Text style={[styles.subTextoErro, { color: colors.subtext }]}>Não há orçamentos pendentes.</Text>
        </View>
      ) : (
        <FlatList
          data={orcamentos}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <View style={[styles.cartao, { backgroundColor: colors.card }]}>
              <View style={styles.cartaoTopo}>
                <Image source={{ uri: item.file_url }} style={styles.imagem} />
                <View style={styles.info}>
                  <Text style={[styles.infoTexto, { color: colors.subtext }]}>
                    <Text style={[styles.negrito, { color: colors.text }]}>Usuário ID: </Text>
                    {item.user_id}
                  </Text>
                  <Text style={[styles.infoTexto, { color: colors.subtext }]}>
                    <Text style={[styles.negrito, { color: colors.text }]}>Material: </Text>
                    {item.material}
                  </Text>
                  <Text style={[styles.infoTexto, { color: colors.subtext }]}>
                    <Text style={[styles.negrito, { color: colors.text }]}>Peso (g): </Text>
                    {item.estimated_grams}
                  </Text>
                  <Text style={styles.preco}>
                    R$ {Number(item.calculated_price).toFixed(2)}
                  </Text>
                </View>
              </View>
              <View style={styles.acoes}>
                <TouchableOpacity
                  style={[styles.botao, styles.botaoRejeitar]}
                  onPress={() => despacharOrdem(item.id, "rejected")}
                >
                  <Ionicons name="close-circle-outline" size={18} color="#FFF" />
                  <Text style={styles.textoBotao}>Rejeitar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.botao, styles.botaoAprovar]}
                  onPress={() => despacharOrdem(item.id, "approved")}
                >
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                  <Text style={styles.textoBotao}>Aprovar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
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
  lista: { padding: 16, gap: 14 },

  cartao: { borderRadius: 12, padding: 15, elevation: 2 },
  cartaoTopo: { flexDirection: "row", marginBottom: 14 },
  imagem: { width: 80, height: 80, borderRadius: 8, backgroundColor: "#EEE" },
  info: { flex: 1, marginLeft: 14, justifyContent: "center" },
  infoTexto: { fontSize: 13, marginBottom: 2 },
  negrito: { fontWeight: "bold" },
  preco: { fontSize: 17, fontWeight: "bold", color: "#9810FA", marginTop: 4 },

  acoes: { flexDirection: "row", gap: 10 },
  botao: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", paddingVertical: 10, borderRadius: 8, gap: 5,
  },
  botaoRejeitar: { backgroundColor: "#DC3545" },
  botaoAprovar: { backgroundColor: "#28A745" },
  textoBotao: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
})

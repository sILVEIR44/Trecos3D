import { useEffect, useState, useContext } from "react"
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Modal, TextInput, Alert
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import api from "../../services/authService"
import { AuthContext } from "../../context/AuthContext"

export default function Dashboard() {
  const { user } = useContext(AuthContext)
  const [dados, setDados] = useState<any>(null)
  const [carregando, setCarregando] = useState(true)

  // Modal de adicionar produto
  const [modalVisivel, setModalVisivel] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [preco, setPreco] = useState("")
  const [estoque, setEstoque] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [enviando, setEnviando] = useState(false)

  async function buscarDashboard() {
    setCarregando(true)
    try {
      const response = await api.get("/dashboard")
      setDados(response.data.dashboard)
    } catch (error: any) {

      Alert.alert("Erro", `Não foi possível carregar o dashboard.\n\n${error?.message ?? "Erro desconhecido"}`)
    } finally {
      setCarregando(false)
    }
  }

  async function adicionarProduto() {
    if (!titulo.trim() || !preco.trim()) {
      Alert.alert("Atenção", "Título e preço são obrigatórios.")
      return
    }

    setEnviando(true)
    try {
      await api.post("/products", {
        title: titulo,
        description: descricao,
        price: parseFloat(preco.replace(",", ".")),
        stock: parseInt(estoque) || 0,
        image_url: imageUrl,
      })

      Alert.alert("Sucesso!", "Produto adicionado ao catálogo.")
      setModalVisivel(false)
      setTitulo("")
      setDescricao("")
      setPreco("")
      setEstoque("")
      setImageUrl("")
      buscarDashboard()
    } catch (error) {
      console.log("Erro ao adicionar produto:", error)
      Alert.alert("Erro", "Não foi possível adicionar o produto.")
    } finally {
      setEnviando(false)
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
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
        {/* Header */}
        <LinearGradient colors={["#9810FA", "#E60076"]} style={styles.header}>
          <Text style={styles.headerSub}>Bem-vindo,</Text>
          <Text style={styles.headerNome}>{user?.name}</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeTexto}>{user?.role}</Text>
          </View>
        </LinearGradient>

        {/* Cards */}
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

        {/* Receita */}
        <View style={styles.receita}>
          <Text style={styles.receitaLabel}>Receita Total</Text>
          <Text style={styles.receitaValor}>
            R$ {Number(dados?.faturamento_total ?? 0).toFixed(2)}
          </Text>
          <Text style={styles.receitaSub}>{dados?.total_pedidos ?? 0} pedidos realizados</Text>
        </View>

        {/* Adicionar produto */}
        <TouchableOpacity style={styles.botaoAdicionar} onPress={() => setModalVisivel(true)}>
          <Ionicons name="add-circle-outline" size={22} color="white" />
          <Text style={styles.botaoAdicionarTexto}>Adicionar Produto</Text>
        </TouchableOpacity>

        {/* Atualizar */}
        <TouchableOpacity style={styles.botaoAtualizar} onPress={buscarDashboard}>
          <Ionicons name="refresh-outline" size={18} color="#9810FA" />
          <Text style={styles.botaoAtualizarTexto}>Atualizar dados</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal adicionar produto */}
      <Modal visible={modalVisivel} animationType="slide" onRequestClose={() => setModalVisivel(false)}>
        <View style={styles.modalContainer}>
          {/* Header modal */}
          <LinearGradient colors={["#9810FA", "#E60076"]} style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisivel(false)}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitulo}>Novo Produto</Text>
            <View style={{ width: 24 }} />
          </LinearGradient>

          <ScrollView contentContainerStyle={styles.modalConteudo}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Dragão Articulado"
              value={titulo}
              onChangeText={setTitulo}
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.inputMultilinha]}
              placeholder="Descreva o produto..."
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Preço (R$) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 29.90"
              value={preco}
              onChangeText={setPreco}
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Estoque</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 10"
              value={estoque}
              onChangeText={setEstoque}
              keyboardType="numeric"
            />

            <Text style={styles.label}>URL da Imagem</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.botaoSalvar, enviando && { opacity: 0.6 }]}
              onPress={adicionarProduto}
              disabled={enviando}
            >
              {enviando ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                  <Text style={styles.botaoSalvarTexto}>Salvar Produto</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  conteudo: { paddingBottom: 40 },

  header: { paddingTop: 55, paddingBottom: 24, paddingHorizontal: 20 },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  headerNome: { color: "white", fontSize: 22, fontWeight: "bold", marginTop: 2 },
  headerBadge: { alignSelf: "flex-start", marginTop: 8, backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  headerBadgeTexto: { color: "white", fontSize: 12, textTransform: "capitalize" },

  cards: { flexDirection: "row", flexWrap: "wrap", padding: 16, gap: 12 },
  card: { width: "47%", borderRadius: 12, padding: 16, alignItems: "center", gap: 6 },
  cardValor: { color: "white", fontSize: 26, fontWeight: "bold" },
  cardLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13 },

  receita: { backgroundColor: "white", marginHorizontal: 16, borderRadius: 12, padding: 20, alignItems: "center", elevation: 2, marginBottom: 16 },
  receitaLabel: { fontSize: 14, color: "#888", marginBottom: 4 },
  receitaValor: { fontSize: 32, fontWeight: "bold", color: "#222" },
  receitaSub: { fontSize: 13, color: "#AAA", marginTop: 4 },

  botaoAdicionar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, paddingVertical: 14, borderRadius: 12, backgroundColor: "#9810FA", marginBottom: 12 },
  botaoAdicionarTexto: { color: "white", fontWeight: "bold", fontSize: 15 },

  botaoAtualizar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: "#9810FA" },
  botaoAtualizarTexto: { color: "#9810FA", fontWeight: "bold" },

  // Modal
  modalContainer: { flex: 1, backgroundColor: "#F5F5F5" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 55, paddingBottom: 16, paddingHorizontal: 20 },
  modalTitulo: { color: "white", fontSize: 18, fontWeight: "bold" },
  modalConteudo: { padding: 20, paddingBottom: 40 },

  label: { fontSize: 14, fontWeight: "bold", color: "#444", marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: "white", borderRadius: 10, borderWidth: 1, borderColor: "#DDD", paddingHorizontal: 14, height: 48, fontSize: 14, color: "#333" },
  inputMultilinha: { height: 90, paddingTop: 12, textAlignVertical: "top" },

  botaoSalvar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#9810FA", paddingVertical: 14, borderRadius: 12, marginTop: 24 },
  botaoSalvarTexto: { color: "white", fontWeight: "bold", fontSize: 16 },
})

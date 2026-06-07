import { useEffect, useState, useContext } from "react"
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  TouchableOpacity, Alert, Modal, TextInput, ScrollView, Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { AuthContext } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import api from "../../services/authService"

type Produto = {
  id: number
  title: string
  description: string
  price: number
  stock: number
  image_url: string
}

export default function Produtos() {
  const { token } = useContext(AuthContext)
  const { colors } = useTheme()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  const [modalVisivel, setModalVisivel] = useState(false)
  const [modoModal, setModoModal] = useState<"adicionar" | "editar">("adicionar")
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null)
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [preco, setPreco] = useState("")
  const [estoque, setEstoque] = useState("")
  const [imagem, setImagem] = useState("")
  const [salvando, setSalvando] = useState(false)

  const headers = { Authorization: `Bearer ${token}` }

  async function buscarProdutos() {
    setCarregando(true)
    setErro(false)
    try {
      const response = await api.get("/products", { headers })
      setProdutos(response.data)
    } catch (error) {
      console.log("Erro ao buscar produtos:", error)
      setErro(true)
    } finally {
      setCarregando(false)
    }
  }

  function abrirAdicao() {
    setModoModal("adicionar")
    setProdutoEditando(null)
    setTitulo(""); setDescricao(""); setPreco(""); setEstoque(""); setImagem("")
    setModalVisivel(true)
  }

  function abrirEdicao(produto: Produto) {
    setModoModal("editar")
    setProdutoEditando(produto)
    setTitulo(produto.title)
    setDescricao(produto.description ?? "")
    setPreco(String(produto.price))
    setEstoque(String(produto.stock))
    setImagem(produto.image_url ?? "")
    setModalVisivel(true)
  }

  function fecharModal() {
    setModalVisivel(false)
    setProdutoEditando(null)
  }

  async function salvarModal() {
    if (!titulo || !preco) {
      Alert.alert("Atenção", "Título e preço são obrigatórios.")
      return
    }
    setSalvando(true)
    const corpo = {
      title: titulo,
      description: descricao,
      price: parseFloat(preco.replace(",", ".")),
      stock: parseInt(estoque) || 0,
      image_url: imagem,
    }
    try {
      if (modoModal === "adicionar") {
        const response = await api.post("/products", corpo, { headers })
        setProdutos(lista => [response.data.product, ...lista])
      } else if (produtoEditando) {
        await api.put(`/products/${produtoEditando.id}`, corpo, { headers })
        setProdutos(lista =>
          lista.map(p => (p.id === produtoEditando.id ? { ...p, ...corpo } : p))
        )
      }
      fecharModal()
    } catch (error) {
      console.log("Erro ao salvar produto:", error)
      Alert.alert("Erro", "Não foi possível salvar o produto.")
    } finally {
      setSalvando(false)
    }
  }

  function confirmarExclusao(produto: Produto) {
    Alert.alert(
      "Excluir Produto",
      `Tem certeza que deseja remover "${produto.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => excluirProduto(produto.id) },
      ]
    )
  }

  async function excluirProduto(id: number) {
    try {
      await api.delete(`/products/${id}`, { headers })
      setProdutos(lista => lista.filter(p => p.id !== id))
    } catch (error) {
      console.log("Erro ao excluir produto:", error)
      Alert.alert("Erro", "Não foi possível excluir o produto.")
    }
  }

  useEffect(() => {
    if (token) buscarProdutos()
  }, [])

  if (carregando) {
    return (
      <View style={[styles.centro, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#9810FA" />
        <Text style={[styles.textoCarregando, { color: colors.subtext }]}>Carregando produtos...</Text>
      </View>
    )
  }

  if (erro) {
    return (
      <View style={[styles.centro, { backgroundColor: colors.background }]}>
        <Ionicons name="cloud-offline-outline" size={60} color="#CCC" />
        <Text style={[styles.textoErro, { color: colors.text }]}>Falha ao carregar produtos</Text>
        <Text style={[styles.subTexto, { color: colors.subtext }]}>Verifique a conexão com o servidor.</Text>
        <TouchableOpacity style={styles.botaoTentar} onPress={buscarProdutos}>
          <Ionicons name="refresh-outline" size={16} color="#9810FA" />
          <Text style={styles.botaoTentarTexto}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.titulo}>Produtos</Text>
          <Text style={styles.subtitulo}>{produtos.length} item(s) na vitrine</Text>
        </View>
        <TouchableOpacity style={styles.botaoAdicionar} onPress={abrirAdicao}>
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={produtos}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <View style={styles.centro}>
            <Ionicons name="cube-outline" size={60} color="#CCC" />
            <Text style={[styles.textoErro, { color: colors.text }]}>Nenhum produto cadastrado.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.cartao, { backgroundColor: colors.card }]}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.imagem} />
            ) : (
              <View style={[styles.imagem, styles.imagemVazia, { backgroundColor: colors.border }]}>
                <Ionicons name="cube-outline" size={30} color="#CCC" />
              </View>
            )}
            <View style={styles.info}>
              <Text style={[styles.nome, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.preco}>R$ {Number(item.price).toFixed(2)}</Text>
              <Text style={[styles.stock, { color: colors.subtext }]}>Estoque: {item.stock}</Text>
            </View>
            <View style={styles.acoes}>
              <TouchableOpacity style={[styles.botao, styles.botaoEditar]} onPress={() => abrirEdicao(item)}>
                <Ionicons name="pencil-outline" size={16} color="#FFF" />
                <Text style={styles.textoBotao}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botao, styles.botaoExcluir]} onPress={() => confirmarExclusao(item)}>
                <Ionicons name="trash-outline" size={16} color="#FFF" />
                <Text style={styles.textoBotao}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal unificado: Adicionar / Editar */}
      <Modal visible={modalVisivel} animationType="slide" onRequestClose={fecharModal}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitulo}>
              {modoModal === "adicionar" ? "Novo Produto" : "Editar Produto"}
            </Text>
            <TouchableOpacity onPress={fecharModal}>
              <Ionicons name="close" size={26} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalForm}>
            <Text style={[styles.label, { color: colors.text }]}>Nome *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Nome do produto"
              placeholderTextColor={colors.placeholder}
              autoCorrect={true}
              autoCapitalize="words"
              spellCheck={true}
            />

            <Text style={[styles.label, { color: colors.text }]}>Preço *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              value={preco}
              onChangeText={setPreco}
              placeholder="Ex: 49.90"
              placeholderTextColor={colors.placeholder}
              autoCorrect={true}
              spellCheck={true}
            />

            <Text style={[styles.label, { color: colors.text }]}>Estoque</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              value={estoque}
              onChangeText={setEstoque}
              placeholder="Quantidade"
              placeholderTextColor={colors.placeholder}
              autoCorrect={true}
              spellCheck={true}
            />

            <Text style={[styles.label, { color: colors.text }]}>URL da Imagem</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              value={imagem}
              onChangeText={setImagem}
              placeholder="https://..."
              placeholderTextColor={colors.placeholder}
              autoCorrect={true}
              spellCheck={true}
            />

            <Text style={[styles.label, { color: colors.text }]}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.inputArea, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={4}
              placeholder="Detalhes do produto..."
              placeholderTextColor={colors.placeholder}
              autoCorrect={true}
              autoCapitalize="sentences"
              spellCheck={true}
            />

            <TouchableOpacity
              style={[styles.botaoSalvar, salvando && styles.botaoSalvarDesabilitado]}
              onPress={salvarModal}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons
                    name={modoModal === "adicionar" ? "add-circle-outline" : "checkmark-circle-outline"}
                    size={20}
                    color="#FFF"
                  />
                  <Text style={styles.textoBotaoSalvar}>
                    {modoModal === "adicionar" ? "Adicionar Produto" : "Salvar Alterações"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, padding: 20 },
  textoCarregando: { fontSize: 15, marginTop: 8 },
  textoErro: { fontSize: 17, fontWeight: "bold", marginTop: 8 },
  subTexto: { fontSize: 14 },
  botaoTentar: {
    flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12,
    borderWidth: 1, borderColor: "#9810FA", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8,
  },
  botaoTentarTexto: { color: "#9810FA", fontWeight: "bold" },

  container: { flex: 1 },
  header: {
    backgroundColor: "#9810FA", paddingTop: 55, paddingBottom: 20, paddingHorizontal: 20,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  titulo: { color: "white", fontSize: 22, fontWeight: "bold" },
  subtitulo: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 4 },
  botaoAdicionar: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, padding: 6 },
  lista: { padding: 16, gap: 12 },

  cartao: { borderRadius: 12, padding: 14, elevation: 2 },
  imagem: { width: "100%", height: 140, borderRadius: 8, marginBottom: 10 },
  imagemVazia: { alignItems: "center", justifyContent: "center" },
  info: { marginBottom: 12 },
  nome: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  preco: { fontSize: 17, fontWeight: "bold", color: "#9810FA" },
  stock: { fontSize: 13, marginTop: 2 },
  acoes: { flexDirection: "row", gap: 10 },
  botao: {
    flex: 1, flexDirection: "row", alignItems: "center",
    justifyContent: "center", paddingVertical: 9, borderRadius: 8, gap: 5,
  },
  botaoEditar: { backgroundColor: "#3B82F6" },
  botaoExcluir: { backgroundColor: "#EF4444" },
  textoBotao: { color: "#FFF", fontWeight: "bold", fontSize: 13 },

  modalContainer: { flex: 1 },
  modalHeader: {
    backgroundColor: "#9810FA", paddingTop: 55, paddingBottom: 20, paddingHorizontal: 20,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  modalTitulo: { color: "white", fontSize: 20, fontWeight: "bold" },
  modalForm: { padding: 20 },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 5, marginTop: 14 },
  input: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 14, height: 48, fontSize: 15,
  },
  inputArea: { height: 100, textAlignVertical: "top", paddingTop: 12 },
  botaoSalvar: {
    backgroundColor: "#9810FA", flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: 15, borderRadius: 10, marginTop: 24, gap: 8,
  },
  botaoSalvarDesabilitado: { opacity: 0.6 },
  textoBotaoSalvar: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
})

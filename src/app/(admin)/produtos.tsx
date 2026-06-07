import { useEffect, useState } from "react"
import {
  View, Text, StyleSheet, FlatList, ActivityIndicator,
  Image, TouchableOpacity, Modal, TextInput, ScrollView, Alert
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import api from "../../services/authService"

export default function Produtos() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)

  // Modal de edição
  const [modalVisivel, setModalVisivel] = useState(false)
  const [confirmarDelete, setConfirmarDelete] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState<any>(null)
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [preco, setPreco] = useState("")
  const [estoque, setEstoque] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [salvando, setSalvando] = useState(false)

  async function buscarProdutos() {
    setCarregando(true)
    try {
      const response = await api.get("/products")
      setProdutos(response.data)
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os produtos.")
    } finally {
      setCarregando(false)
    }
  }

  function abrirEdicao(produto: any) {
    setProdutoEditando(produto)
    setTitulo(produto.title)
    setDescricao(produto.description || "")
    setPreco(String(produto.price))
    setEstoque(String(produto.stock ?? 0))
    setImageUrl(produto.image_url || "")
    setModalVisivel(true)
  }

  function fecharModal() {
    setModalVisivel(false)
    setProdutoEditando(null)
  }

  async function salvarEdicao() {
    if (!titulo.trim() || !preco.trim()) {
      Alert.alert("Atenção", "Título e preço são obrigatórios.")
      return
    }

    setSalvando(true)
    try {
      await api.put(`/products/${produtoEditando.id}`, {
        title: titulo,
        description: descricao,
        price: parseFloat(preco.replace(",", ".")),
        stock: parseInt(estoque) || 0,
        image_url: imageUrl,
      })
      fecharModal()
      buscarProdutos()
      setTimeout(() => Alert.alert("Sucesso!", "Produto atualizado."), 300)
    } catch (error) {
      fecharModal()
      setTimeout(() => Alert.alert("Erro", "Não foi possível atualizar o produto."), 300)
    } finally {
      setSalvando(false)
    }
  }

  async function deletarProduto() {
    try {
      await api.delete(`/products/${produtoEditando.id}`)
      setConfirmarDelete(false)
      fecharModal()
      buscarProdutos()
    } catch (error) {
      setConfirmarDelete(false)
    }
  }

  useEffect(() => {
    buscarProdutos()
  }, [])

  function renderizarProduto({ item }: any) {
    return (
      <View style={styles.card}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.imagem} />
        ) : (
          <View style={styles.imagemVazia}>
            <Ionicons name="cube-outline" size={36} color="#CCC" />
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.titulo} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.descricao} numberOfLines={2}>{item.description || "Sem descrição."}</Text>
          <View style={styles.rodape}>
            <Text style={styles.preco}>R$ {Number(item.price).toFixed(2)}</Text>
            <View style={styles.badgeEstoque}>
              <Text style={styles.badgeTexto}>Estoque: {item.stock ?? 0}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.btnEditar} onPress={() => abrirEdicao(item)}>
          <Ionicons name="create-outline" size={22} color="#9810FA" />
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#9810FA", "#E60076"]} style={styles.header}>
        <Text style={styles.headerTitulo}>Produtos</Text>
        <Text style={styles.headerSub}>{produtos.length} produto{produtos.length !== 1 ? "s" : ""} no catálogo</Text>
      </LinearGradient>

      {carregando ? (
        <ActivityIndicator size="large" color="#9810FA" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={produtos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderizarProduto}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.vazio}>
              <Ionicons name="cube-outline" size={60} color="#CCC" />
              <Text style={styles.vazioTexto}>Nenhum produto cadastrado.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.botaoAtualizar} onPress={buscarProdutos}>
        <Ionicons name="refresh-outline" size={18} color="#9810FA" />
        <Text style={styles.botaoAtualizarTexto}>Atualizar</Text>
      </TouchableOpacity>

      {/* Modal de edição */}
      <Modal visible={modalVisivel} animationType="slide" onRequestClose={fecharModal}>
        <View style={styles.modalContainer}>
          <LinearGradient colors={["#9810FA", "#E60076"]} style={styles.modalHeader}>
            <TouchableOpacity onPress={fecharModal}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitulo}>Editar Produto</Text>
            <TouchableOpacity onPress={() => setConfirmarDelete(true)}>
              <Ionicons name="trash-outline" size={22} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView contentContainerStyle={styles.modalConteudo}>
            <Text style={styles.label}>Título *</Text>
            <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Título do produto" />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.inputMultilinha]}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Descrição do produto"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Preço (R$) *</Text>
            <TextInput
              style={styles.input}
              value={preco}
              onChangeText={setPreco}
              placeholder="Ex: 29.90"
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Estoque</Text>
            <TextInput
              style={styles.input}
              value={estoque}
              onChangeText={setEstoque}
              placeholder="Ex: 10"
              keyboardType="numeric"
            />

            <Text style={styles.label}>URL da Imagem</Text>
            <TextInput
              style={styles.input}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://..."
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.botaoSalvar, salvando && { opacity: 0.6 }]}
              onPress={salvarEdicao}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                  <Text style={styles.botaoSalvarTexto}>Salvar Alterações</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Confirmação de delete dentro do modal */}
            {confirmarDelete && (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmTexto}>Remover "{produtoEditando?.title}"?</Text>
                <View style={styles.confirmBotoes}>
                  <TouchableOpacity style={styles.confirmCancelar} onPress={() => setConfirmarDelete(false)}>
                    <Text style={styles.confirmCancelarTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmRemover} onPress={deletarProduto}>
                    <Text style={styles.confirmRemoverTexto}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  header: { paddingTop: 55, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitulo: { color: "white", fontSize: 22, fontWeight: "bold" },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 },

  lista: { padding: 16, gap: 12, paddingBottom: 80 },

  card: { backgroundColor: "white", borderRadius: 12, flexDirection: "row", alignItems: "center", padding: 12, elevation: 2 },
  imagem: { width: 75, height: 75, borderRadius: 8, backgroundColor: "#EEE" },
  imagemVazia: { width: 75, height: 75, borderRadius: 8, backgroundColor: "#EEE", alignItems: "center", justifyContent: "center" },

  info: { flex: 1, marginLeft: 12 },
  titulo: { fontSize: 15, fontWeight: "bold", color: "#222", marginBottom: 4 },
  descricao: { fontSize: 12, color: "#888", marginBottom: 8 },

  rodape: { flexDirection: "row", alignItems: "center", gap: 8 },
  preco: { fontSize: 15, fontWeight: "bold", color: "#9810FA" },
  badgeEstoque: { backgroundColor: "#F3E8FF", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeTexto: { fontSize: 11, color: "#9810FA", fontWeight: "bold" },

  btnEditar: { padding: 8, marginLeft: 4 },

  vazio: { alignItems: "center", marginTop: 60, gap: 12 },
  vazioTexto: { color: "#AAA", fontSize: 15 },

  botaoAtualizar: {
    position: "absolute", bottom: 20, alignSelf: "center",
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "white", paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: "#9810FA", elevation: 3,
  },
  botaoAtualizarTexto: { color: "#9810FA", fontWeight: "bold" },

  modalContainer: { flex: 1, backgroundColor: "#F5F5F5" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 55, paddingBottom: 16, paddingHorizontal: 20 },
  modalTitulo: { color: "white", fontSize: 18, fontWeight: "bold" },
  modalConteudo: { padding: 20, paddingBottom: 40 },

  label: { fontSize: 14, fontWeight: "bold", color: "#444", marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: "white", borderRadius: 10, borderWidth: 1, borderColor: "#DDD", paddingHorizontal: 14, height: 48, fontSize: 14, color: "#333" },
  inputMultilinha: { height: 90, paddingTop: 12, textAlignVertical: "top" },

  botaoSalvar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#9810FA", paddingVertical: 14, borderRadius: 12, marginTop: 24 },
  confirmBox: { backgroundColor: "#FEF2F2", borderRadius: 12, padding: 16, marginTop: 16, gap: 12 },
  confirmTexto: { fontSize: 14, fontWeight: "bold", color: "#222", textAlign: "center" },
  confirmBotoes: { flexDirection: "row", gap: 10 },
  confirmCancelar: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: "#DDD", alignItems: "center" },
  confirmCancelarTexto: { color: "#555", fontWeight: "bold" },
  confirmRemover: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: "#EF4444", alignItems: "center" },
  confirmRemoverTexto: { color: "white", fontWeight: "bold" },
  botaoSalvarTexto: { color: "white", fontWeight: "bold", fontSize: 16 },
})

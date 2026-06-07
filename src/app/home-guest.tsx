import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import api from "../services/authService"

const CATEGORIAS = ["Todos", "Brinquedos", "Utilitários", "Decoração"]

export default function HomeGuest() {
  const router = useRouter()
  const [produtos, setProdutos] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState("")
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos")
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null)

  async function buscarProdutos() {
    try {
      const response = await api.get("/products")
      setProdutos(response.data)
    } catch (error) {
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    buscarProdutos()
  }, [])

  const produtosFiltrados = produtos.filter((p) => {
    const nomeOk = p.title?.toLowerCase().includes(busca.toLowerCase())
    const categoriaOk = categoriaAtiva === "Todos" || p.category === categoriaAtiva
    return nomeOk && categoriaOk
  })

  // Qualquer ação que precise de login manda para o login
  function irParaLogin() {
    setProdutoSelecionado(null)
    router.replace("/login")
  }

  function renderizarProduto({ item }: any) {
    return (
      <TouchableOpacity style={styles.card} onPress={() => setProdutoSelecionado(item)}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.imagemCard} />
        ) : (
          <View style={styles.imagemVazia} />
        )}

        <View style={styles.badgeEstoque}>
          <Text style={styles.badgeTexto}>Em Estoque</Text>
        </View>

        {item.category ? (
          <View style={styles.badgeCategoria}>
            <Text style={styles.badgeCategoriaTexto}>{item.category}</Text>
          </View>
        ) : null}

        <View style={styles.cardInfo}>
          <Text style={styles.cardTitulo} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardDescricao} numberOfLines={2}>{item.description}</Text>
          <View style={styles.cardRodape}>
            <Text style={styles.cardPreco}>R$ {Number(item.price).toFixed(2)}</Text>
            <TouchableOpacity style={styles.botaoComprar} onPress={irParaLogin}>
              <Text style={styles.botaoComprarTexto}>Comprar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#9810FA", "#E60076"]} style={styles.header}>
        <View style={styles.headerTopo}>
          <Text style={styles.headerLogo}>Loja 3D</Text>
          {/* Botão de login no canto */}
          <TouchableOpacity style={styles.botaoLogin} onPress={irParaLogin}>
            <Ionicons name="log-in-outline" size={18} color="#9810FA" />
            <Text style={styles.botaoLoginTexto}>Entrar</Text>
          </TouchableOpacity>
        </View>

      </LinearGradient>

      {/* Busca */}
      <View style={styles.buscaContainer}>
        <Ionicons name="search-outline" size={18} color="#888" style={styles.buscaIcone} />
        <TextInput
          style={styles.buscaInput}
          placeholder="Buscar produtos..."
          placeholderTextColor="#888"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtrosScroll}
        contentContainerStyle={styles.filtrosConteudo}
      >
        {CATEGORIAS.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filtro, categoriaAtiva === cat && styles.filtroAtivo]}
            onPress={() => setCategoriaAtiva(cat)}
          >
            <Text style={[styles.filtroTexto, categoriaAtiva === cat && styles.filtroTextoAtivo]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista */}
      {carregando ? (
        <ActivityIndicator size="large" color="#9810FA" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={produtosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderizarProduto}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.listaVazia}>Nenhum produto encontrado.</Text>
          }
        />
      )}

      {/* Modal detalhe */}
      <Modal
        visible={produtoSelecionado !== null}
        animationType="slide"
        onRequestClose={() => setProdutoSelecionado(null)}
      >
        {produtoSelecionado && (
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalBotaoFechar}
              onPress={() => setProdutoSelecionado(null)}
            >
              <Ionicons name="arrow-back" size={24} color="#222" />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              {produtoSelecionado.image_url ? (
                <Image source={{ uri: produtoSelecionado.image_url }} style={styles.modalImagem} />
              ) : (
                <View style={styles.modalImagemVazia}>
                  <Ionicons name="cube-outline" size={80} color="#CCC" />
                </View>
              )}

              <View style={styles.modalConteudo}>
                <View style={[styles.badgeEstoque, { position: "relative", top: 0, right: 0, alignSelf: "flex-start", marginBottom: 12 }]}>
                  <Text style={styles.badgeTexto}>✓ Em Estoque</Text>
                </View>

                <Text style={styles.modalTitulo}>{produtoSelecionado.title}</Text>
                <Text style={styles.modalPreco}>R$ {Number(produtoSelecionado.price).toFixed(2)}</Text>

                <View style={styles.divisor} />

                <Text style={styles.modalSecao}>Descrição</Text>
                <Text style={styles.modalDescricao}>
                  {produtoSelecionado.description || "Sem descrição disponível."}
                </Text>

                <View style={styles.divisor} />

                <Text style={styles.modalSecao}>Informações</Text>
                <View style={styles.infoLinha}>
                  <Ionicons name="cube-outline" size={18} color="#9810FA" />
                  <Text style={styles.infoTexto}>Materiais: PLA, ABS, PETG, Resina</Text>
                </View>
                <View style={styles.infoLinha}>
                  <Ionicons name="layers-outline" size={18} color="#9810FA" />
                  <Text style={styles.infoTexto}>Impressão 3D de alta qualidade</Text>
                </View>
                <View style={styles.infoLinha}>
                  <Ionicons name="storefront-outline" size={18} color="#9810FA" />
                  <Text style={styles.infoTexto}>Retirada imediata na loja</Text>
                </View>
              </View>
            </ScrollView>

            {/* Rodapé — manda pro login */}
            <View style={styles.modalRodape}>
              <View>
                <Text style={styles.modalRodapeLabel}>Total</Text>
                <Text style={styles.modalRodapePreco}>
                  R$ {Number(produtoSelecionado.price).toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity style={styles.modalBotaoComprar} onPress={irParaLogin}>
                <Ionicons name="log-in-outline" size={20} color="white" />
                <Text style={styles.modalBotaoComprarTexto}>Entre para Comprar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16 },
  headerTopo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  headerLogo: { fontSize: 20, fontWeight: "bold", color: "white" },
  botaoLogin: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  botaoLoginTexto: { color: "#9810FA", fontWeight: "bold", fontSize: 13 },

  banner: { flexDirection: "row", gap: 10 },
  bannerCard: { flex: 1, borderRadius: 10, padding: 12 },
  bannerTitulo: { color: "white", fontWeight: "bold", fontSize: 13, marginBottom: 4 },
  bannerSub: { color: "white", fontSize: 11, opacity: 0.9 },

  buscaContainer: {
    flexDirection: "row", alignItems: "center", backgroundColor: "white",
    marginHorizontal: 16, marginTop: 14, borderRadius: 10, paddingHorizontal: 12, elevation: 2,
  },
  buscaIcone: { marginRight: 8 },
  buscaInput: { flex: 1, height: 42, fontSize: 14, color: "#333" },

  filtrosScroll: { marginTop: 12, maxHeight: 40 },
  filtrosConteudo: { paddingHorizontal: 16, gap: 8 },
  filtro: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: "white", borderWidth: 1, borderColor: "#DDD" },
  filtroAtivo: { backgroundColor: "#9810FA", borderColor: "#9810FA" },
  filtroTexto: { fontSize: 13, color: "#555" },
  filtroTextoAtivo: { color: "white", fontWeight: "bold" },

  lista: { padding: 16, gap: 14 },
  listaVazia: { textAlign: "center", marginTop: 50, color: "#888", fontSize: 15 },

  card: { backgroundColor: "white", borderRadius: 12, overflow: "hidden", elevation: 2 },
  imagemCard: { width: "100%", height: 180, backgroundColor: "#EEE" },
  imagemVazia: { width: "100%", height: 180, backgroundColor: "#DDD" },
  badgeEstoque: { position: "absolute", top: 10, right: 10, backgroundColor: "#22C55E", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeTexto: { color: "white", fontSize: 11, fontWeight: "bold" },
  badgeCategoria: { position: "absolute", top: 10, left: 10, backgroundColor: "#9810FA22", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeCategoriaTexto: { color: "#9810FA", fontSize: 11, fontWeight: "bold" },
  cardInfo: { padding: 12 },
  cardTitulo: { fontSize: 16, fontWeight: "bold", color: "#222", marginBottom: 4 },
  cardDescricao: { fontSize: 13, color: "#666", marginBottom: 10 },
  cardRodape: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardPreco: { fontSize: 17, fontWeight: "bold", color: "#222" },
  botaoComprar: { backgroundColor: "#1A1A1A", paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  botaoComprarTexto: { color: "white", fontWeight: "bold", fontSize: 14 },

  modalContainer: { flex: 1, backgroundColor: "#F5F5F5" },
  modalBotaoFechar: { position: "absolute", top: 50, left: 16, zIndex: 10, backgroundColor: "white", borderRadius: 20, padding: 8, elevation: 3 },
  modalImagem: { width: "100%", height: 320, backgroundColor: "#EEE" },
  modalImagemVazia: { width: "100%", height: 320, backgroundColor: "#EEE", alignItems: "center", justifyContent: "center" },
  modalConteudo: { backgroundColor: "white", borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20, padding: 20, paddingBottom: 120 },
  modalTitulo: { fontSize: 22, fontWeight: "bold", color: "#222", marginBottom: 8 },
  modalPreco: { fontSize: 26, fontWeight: "bold", color: "#9810FA", marginBottom: 16 },
  divisor: { height: 1, backgroundColor: "#EEE", marginVertical: 16 },
  modalSecao: { fontSize: 15, fontWeight: "bold", color: "#444", marginBottom: 10 },
  modalDescricao: { fontSize: 14, color: "#666", lineHeight: 22 },
  infoLinha: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 10 },
  infoTexto: { fontSize: 14, color: "#555" },
  modalRodape: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "white", flexDirection: "row", alignItems: "center", padding: 16, paddingBottom: 28, elevation: 10, borderTopWidth: 1, borderTopColor: "#EEE", gap: 12 },
  modalRodapeLabel: { fontSize: 12, color: "#888" },
  modalRodapePreco: { fontSize: 18, fontWeight: "bold", color: "#222" },
  modalBotaoComprar: { flex: 1, backgroundColor: "#9810FA", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 12, gap: 8 },
  modalBotaoComprarTexto: { color: "white", fontWeight: "bold", fontSize: 15 },
})

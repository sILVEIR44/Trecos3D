import { useState, useEffect, useContext } from "react"
import {
  View, Text, StyleSheet, ActivityIndicator,
  Image, TouchableOpacity, TextInput, ScrollView, Modal, Alert,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import api from "../../services/authService"
import { CartContext } from "../../context/CartContext"
import { useTheme } from "../../context/ThemeContext"

const CATEGORIAS = ["Todos", "Brinquedos", "Utilitários", "Decoração"]

export default function Home() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState("")
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos")
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null)
  const [materialSelecionado, setMaterialSelecionado] = useState("PLA")
  const router = useRouter()
  const { adicionarAoCarrinho } = useContext(CartContext)
  const { colors } = useTheme()

  async function buscarProdutos() {
    try {
      const response = await api.get("/products")
      setProdutos(response.data)
    } catch (error) {
      // erro silencioso
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    buscarProdutos()
  }, [])

  const produtosFiltrados = produtos.filter(p => {
    const nomeOk = p.title?.toLowerCase().includes(busca.toLowerCase())
    const categoriaOk = categoriaAtiva === "Todos" || p.category === categoriaAtiva
    return nomeOk && categoriaOk
  })


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header fixo */}
      <LinearGradient colors={["#9810FA", "#E60076"]} style={styles.header}>
        <View style={styles.headerTopo}>
          <Text style={styles.headerLogo}>Loja 3D</Text>
          <TouchableOpacity onPress={() => Alert.alert("Notificações", "Funcionalidade não desenvolvida ainda.")}>
            <Ionicons name="notifications-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Todo o conteúdo num único ScrollView */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Busca */}
        <View style={[styles.buscaContainer, { backgroundColor: colors.card }]}>
          <Ionicons name="search-outline" size={18} color={colors.subtext} style={styles.buscaIcone} />
          <TextInput
            style={[styles.buscaInput, { color: colors.text }]}
            placeholder="Buscar produtos..."
            placeholderTextColor={colors.placeholder}
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        {/* Filtros por categoria */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtrosScroll}
          contentContainerStyle={styles.filtrosConteudo}
          nestedScrollEnabled
        >
          {CATEGORIAS.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filtro,
                { backgroundColor: colors.card, borderColor: colors.border },
                categoriaAtiva === cat && styles.filtroAtivo,
              ]}
              onPress={() => setCategoriaAtiva(cat)}
            >
              <Text style={[
                styles.filtroTexto,
                { color: colors.subtext },
                categoriaAtiva === cat && styles.filtroTextoAtivo,
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Banner orçamento */}
        <TouchableOpacity
          style={styles.bannerOrcamento}
          onPress={() => router.push("/novo-orcamento")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#9810FA", "#E60076"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bannerGradient}
          >
            <Ionicons name="print-outline" size={26} color="white" />
            <View style={styles.bannerTextos}>
              <Text style={styles.bannerTitulo}>Tem uma peça para imprimir?</Text>
              <Text style={styles.bannerSub}>Solicite um orçamento grátis →</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Produtos */}
        <View style={styles.lista}>
          {carregando ? (
            <ActivityIndicator size="large" color="#9810FA" style={{ marginVertical: 40 }} />
          ) : produtosFiltrados.length === 0 ? (
            <Text style={[styles.listaVazia, { color: colors.subtext }]}>
              Nenhum produto encontrado.
            </Text>
          ) : (
            produtosFiltrados.map(item => (
              <TouchableOpacity
                key={item.id.toString()}
                style={[styles.card, { backgroundColor: colors.card }]}
                onPress={() => { setProdutoSelecionado(item); setMaterialSelecionado("PLA") }}
              >
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={styles.imagemCard} />
                ) : (
                  <View style={[styles.imagemVazia, { backgroundColor: colors.border }]} />
                )}
                <View style={styles.badgeEstoque}>
                  <Text style={styles.badgeTexto}>Em Estoque</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitulo, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.category && (
                    <Text style={[styles.cardCategoria, { color: colors.subtext }]}>{item.category}</Text>
                  )}
                  <Text style={[styles.cardDescricao, { color: colors.subtext }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.cardRodape}>
                    <Text style={[styles.cardPreco, { color: colors.text }]}>
                      R$ {Number(item.price).toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      style={styles.botaoComprar}
                      onPress={() => adicionarAoCarrinho(item)}
                    >
                      <Text style={styles.botaoComprarTexto}>Comprar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal de detalhe do produto */}
      <Modal
        visible={produtoSelecionado !== null}
        animationType="slide"
        onRequestClose={() => setProdutoSelecionado(null)}
      >
        {produtoSelecionado && (
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <TouchableOpacity
              style={[styles.modalBotaoFechar, { backgroundColor: colors.card }]}
              onPress={() => setProdutoSelecionado(null)}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              {produtoSelecionado.image_url ? (
                <Image source={{ uri: produtoSelecionado.image_url }} style={styles.modalImagem} />
              ) : (
                <View style={[styles.modalImagemVazia, { backgroundColor: colors.border }]}>
                  <Ionicons name="cube-outline" size={80} color="#CCC" />
                </View>
              )}

              <View style={[styles.modalConteudo, { backgroundColor: colors.card }]}>
                <View style={styles.badgeEstoque}>
                  <Text style={styles.badgeTexto}>✓ Em Estoque</Text>
                </View>
                <Text style={[styles.modalTitulo, { color: colors.text }]}>
                  {produtoSelecionado.title}
                </Text>
                <Text style={styles.modalPreco}>
                  R$ {Number(produtoSelecionado.price).toFixed(2)}
                </Text>
                <View style={[styles.divisor, { backgroundColor: colors.divider }]} />
                <Text style={[styles.modalSecao, { color: colors.text }]}>Descrição</Text>
                <Text style={[styles.modalDescricao, { color: colors.subtext }]}>
                  {produtoSelecionado.description || "Sem descrição disponível."}
                </Text>
                <View style={[styles.divisor, { backgroundColor: colors.divider }]} />
                <Text style={[styles.modalSecao, { color: colors.text }]}>Material de Impressão</Text>
                <View style={styles.materiaisRow}>
                  {["PLA", "ABS", "PETG"].map((mat) => (
                    <TouchableOpacity
                      key={mat}
                      style={[
                        styles.materialChip,
                        { borderColor: colors.border, backgroundColor: colors.background },
                        materialSelecionado === mat && styles.materialChipAtivo,
                      ]}
                      onPress={() => setMaterialSelecionado(mat)}
                    >
                      <Text style={[
                        styles.materialChipTexto,
                        { color: colors.subtext },
                        materialSelecionado === mat && styles.materialChipTextoAtivo,
                      ]}>
                        {mat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.modalSecao, { color: colors.text, marginTop: 16 }]}>Informações</Text>
                {[
                  ["layers-outline", "Impressão 3D de alta qualidade"],
                  ["storefront-outline", "Retirada imediata na loja"],
                  ["checkmark-circle-outline", "Acabamento profissional"],
                ].map(([icon, texto]) => (
                  <View key={texto} style={styles.infoLinha}>
                    <Ionicons name={icon as any} size={18} color="#9810FA" />
                    <Text style={[styles.infoTexto, { color: colors.subtext }]}>{texto}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={[styles.modalRodape, { backgroundColor: colors.card, borderTopColor: colors.divider }]}>
              <View>
                <Text style={[styles.modalRodapeLabel, { color: colors.subtext }]}>Total</Text>
                <Text style={[styles.modalRodapePreco, { color: colors.text }]}>
                  R$ {Number(produtoSelecionado.price).toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalBotaoComprar}
                onPress={() => {
                  adicionarAoCarrinho({ ...produtoSelecionado, material_selecionado: materialSelecionado })
                  setProdutoSelecionado(null)
                }}
              >
                <Ionicons name="cart-outline" size={20} color="white" />
                <Text style={styles.modalBotaoComprarTexto}>Adicionar ao Carrinho</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16 },
  headerTopo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  headerLogo: { fontSize: 20, fontWeight: "bold", color: "white" },

  buscaContainer: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 16, marginTop: 14,
    borderRadius: 10, paddingHorizontal: 12, elevation: 2,
  },
  buscaIcone: { marginRight: 8 },
  buscaInput: { flex: 1, height: 42, fontSize: 14 },

  filtrosScroll: { marginTop: 12, height: 46 },
  filtrosConteudo: { paddingHorizontal: 16, gap: 8, alignItems: "center", height: 46 },
  filtro: {
    height: 34, minWidth: 80, paddingHorizontal: 16,
    borderRadius: 17, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  filtroAtivo: { backgroundColor: "#9810FA", borderColor: "#9810FA" },
  filtroTexto: { fontSize: 13 },
  filtroTextoAtivo: { color: "white", fontWeight: "bold" },

  bannerOrcamento: { marginHorizontal: 16, marginTop: 12, borderRadius: 14, overflow: "hidden", elevation: 3 },
  bannerGradient: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, gap: 12 },
  bannerTextos: { flex: 1 },
  bannerTitulo: { color: "white", fontWeight: "bold", fontSize: 15 },
  bannerSub: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 2 },

  lista: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32, gap: 12, flexDirection: "column" },
  listaVazia: { textAlign: "center", marginTop: 50, fontSize: 15 },

  card: { borderRadius: 12, overflow: "hidden", elevation: 2 },
  imagemCard: { width: "100%", height: 180 },
  imagemVazia: { width: "100%", height: 180 },

  badgeEstoque: {
    position: "absolute", top: 10, right: 10,
    backgroundColor: "#22C55E", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  badgeTexto: { color: "white", fontSize: 11, fontWeight: "bold" },
  cardInfo: { padding: 12 },
  cardTitulo: { fontSize: 16, fontWeight: "bold", marginBottom: 2 },
  cardCategoria: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 },
  cardDescricao: { fontSize: 13, marginBottom: 10 },
  cardRodape: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardPreco: { fontSize: 17, fontWeight: "bold" },
  botaoComprar: { backgroundColor: "#1A1A1A", paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  botaoComprarTexto: { color: "white", fontWeight: "bold", fontSize: 14 },

  modalContainer: { flex: 1 },
  modalBotaoFechar: {
    position: "absolute", top: 50, left: 16, zIndex: 10,
    borderRadius: 20, padding: 8, elevation: 3,
  },
  modalImagem: { width: "100%", height: 320 },
  modalImagemVazia: { width: "100%", height: 320, alignItems: "center", justifyContent: "center" },
  modalConteudo: {
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    marginTop: -20, padding: 20, paddingBottom: 120,
  },
  modalTitulo: { fontSize: 22, fontWeight: "bold", marginTop: 10, marginBottom: 8 },
  modalPreco: { fontSize: 26, fontWeight: "bold", color: "#9810FA", marginBottom: 16 },
  divisor: { height: 1, marginVertical: 16 },
  modalSecao: { fontSize: 15, fontWeight: "bold", marginBottom: 10 },
  modalDescricao: { fontSize: 14, lineHeight: 22 },
  infoLinha: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 10 },
  infoTexto: { fontSize: 14 },
  modalRodape: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center",
    padding: 16, paddingBottom: 28, elevation: 10, borderTopWidth: 1, gap: 12,
  },
  materiaisRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  materialChip: {
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 10, borderWidth: 1.5,
  },
  materialChipAtivo: { backgroundColor: "#9810FA", borderColor: "#9810FA" },
  materialChipTexto: { fontWeight: "bold", fontSize: 14 },
  materialChipTextoAtivo: { color: "white" },

  modalRodapeLabel: { fontSize: 12 },
  modalRodapePreco: { fontSize: 18, fontWeight: "bold" },
  modalBotaoComprar: {
    flex: 1, backgroundColor: "#9810FA", flexDirection: "row",
    alignItems: "center", justifyContent: "center",
    paddingVertical: 14, borderRadius: 12, gap: 8,
  },
  modalBotaoComprarTexto: { color: "white", fontWeight: "bold", fontSize: 15 },
})

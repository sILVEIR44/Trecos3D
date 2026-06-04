import { useState, useEffect, useContext } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/authService";
import { CartContext } from "../../context/CartContext";

const CATEGORIAS = ["Todos", "Brinquedos", "Utilitários", "Decoração"];

export default function Home() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");

  const { adicionarAoCarrinho } = useContext(CartContext);

  async function buscarProdutos() {
    try {
      const response = await api.get("/products");
      setProdutos(response.data);
    } catch (error) {
      console.log("Erro ao buscar produtos:", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    buscarProdutos();
  }, []);

  // Filtra por busca e categoria
  const produtosFiltrados = produtos.filter((p) => {
    const nomeOk = p.title?.toLowerCase().includes(busca.toLowerCase());
    const categoriaOk =
      categoriaAtiva === "Todos" || p.category === categoriaAtiva;
    return nomeOk && categoriaOk;
  });

  function renderizarProduto({ item }: any) {
    return (
      <View style={styles.card}>
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
          <Text style={styles.cardTitulo} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardDescricao} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.cardRodape}>
            <Text style={styles.cardPreco}>
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header com gradiente */}
      <LinearGradient colors={["#9810FA", "#E60076"]} style={styles.header}>
        <View style={styles.headerTopo}>
          <Text style={styles.headerLogo}>Loja 3D</Text>
          <View style={styles.headerIcones}>
            <Ionicons name="notifications-outline" size={22} color="white" />
            <Ionicons
              name="cart-outline"
              size={22}
              color="white"
              style={{ marginLeft: 14 }}
            />
            <Ionicons
              name="person-outline"
              size={22}
              color="white"
              style={{ marginLeft: 14 }}
            />
          </View>
        </View>

        {/* Banner promoção */}
        <View style={styles.banner}>
          <LinearGradient
            colors={["#C840F0", "#F040A0"]}
            style={styles.bannerCard}
          >
            <Text style={styles.bannerTitulo}>Primeira compra!</Text>
            <Text style={styles.bannerSub}>
              Ganhe 10% OFF com o cupom{"\n"}PRIMEIROS
            </Text>
          </LinearGradient>
          <LinearGradient
            colors={["#7B10D0", "#B00060"]}
            style={styles.bannerCard}
          >
            <Text style={styles.bannerTitulo}>Programa Fidelidade</Text>
            <Text style={styles.bannerSub}>
              3 compras = 1 desconto{"\n"}especial!
            </Text>
          </LinearGradient>
        </View>
      </LinearGradient>

      {/* Busca */}
      <View style={styles.buscaContainer}>
        <Ionicons
          name="search-outline"
          size={18}
          color="#888"
          style={styles.buscaIcone}
        />
        <TextInput
          style={styles.buscaInput}
          placeholder="Buscar produtos..."
          placeholderTextColor="#888"
          value={busca}
          onChangeText={setBusca}
        />
      </View>

      {/* Filtros de categoria */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtrosScroll}
        contentContainerStyle={styles.filtrosConteudo}
      >
        {CATEGORIAS.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filtro,
              categoriaAtiva === cat && styles.filtroAtivo,
            ]}
            onPress={() => setCategoriaAtiva(cat)}
          >
            <Text
              style={[
                styles.filtroTexto,
                categoriaAtiva === cat && styles.filtroTextoAtivo,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de produtos */}
      {carregando ? (
        <ActivityIndicator
          size="large"
          color="#9810FA"
          style={{ marginTop: 40 }}
        />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  // Header
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTopo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  headerLogo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  headerIcones: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Banner
  banner: {
    flexDirection: "row",
    gap: 10,
  },
  bannerCard: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
  },
  bannerTitulo: {
    color: "white",
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 4,
  },
  bannerSub: {
    color: "white",
    fontSize: 11,
    opacity: 0.9,
  },

  // Busca
  buscaContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 10,
    paddingHorizontal: 12,
    elevation: 2,
  },
  buscaIcone: {
    marginRight: 8,
  },
  buscaInput: {
    flex: 1,
    height: 42,
    fontSize: 14,
    color: "#333",
  },

  // Filtros
  filtrosScroll: {
    marginTop: 12,
    maxHeight: 40,
  },
  filtrosConteudo: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filtro: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  filtroAtivo: {
    backgroundColor: "#9810FA",
    borderColor: "#9810FA",
  },
  filtroTexto: {
    fontSize: 13,
    color: "#555",
  },
  filtroTextoAtivo: {
    color: "white",
    fontWeight: "bold",
  },

  // Lista
  lista: {
    padding: 16,
    gap: 14,
  },
  listaVazia: {
    textAlign: "center",
    marginTop: 50,
    color: "#888",
    fontSize: 15,
  },

  // Card produto
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
  },
  imagemCard: {
    width: "100%",
    height: 180,
    backgroundColor: "#EEE",
  },
  imagemVazia: {
    width: "100%",
    height: 180,
    backgroundColor: "#DDD",
  },
  badgeEstoque: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#22C55E",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeTexto: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  badgeCategoria: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#9810FA22",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeCategoriaTexto: {
    color: "#9810FA",
    fontSize: 11,
    fontWeight: "bold",
  },
  cardInfo: {
    padding: 12,
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  cardDescricao: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
  },
  cardRodape: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardPreco: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
  },
  botaoComprar: {
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  botaoComprarTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});

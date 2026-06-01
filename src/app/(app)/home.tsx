import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from "react-native";
import api from "../../services/authService";

export default function Home() {
  // Onde os produtos serão guardados
  const [produtos, setProdutos] = useState<any[]>([]);
  // Uma roda de loading
  const [carregando, setCarregando] = useState(true);

  // A função de busca
  async function buscarCatalogo() {
    try {
      // Bate na rota pública de listar produtos
      const response = await api.get('/products');
      
      // Guarda os produtos 
      setProdutos(response.data);
    } catch (error) {
      console.log("Erro ao buscar a vitrine: ", error);
      alert("Falha de comunicação com os armazéns do Império.");
    } finally {
      // Para o load
      setCarregando(false); 
    }
  }

  // O useEffect com essa array vazia [] no final significa: 
  // "Rode esta função APENAS UMA VEZ assim que o usuário entrar nesta tela."
  useEffect(() => {
    buscarCatalogo();
  }, []);

  function renderizarProduto({ item }: any) {
    return (
      <View style={styles.cardProduto}>
        {/* Se o produto tiver link de imagem, renderiza. Se não, desenha um quadrado vazio. */}
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.imagem} />
        ) : (
          <View style={styles.imagemVazia} />
        )}
        <View style={styles.infoProduto}>
          <Text style={styles.tituloProduto}>{item.title}</Text>
          <Text style={styles.precoProduto}>R$ {item.price}</Text>
        </View>
      </View>
    );
  }

  // O que realmente aparece 
  return (
    <View style={styles.container}>
      <Text style={styles.headerTitulo}>Catálogo 3D</Text>
      
      {/* Se estiver carregando, mostra o loading. Se não, mostra a lista. */}
      {carregando ? (
        <ActivityIndicator size="large" color="black" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={produtos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderizarProduto}
          contentContainerStyle={{ paddingBottom: 20 }}
          // Se a lista estiver vazia (banco de dados zerado):
          ListEmptyComponent={<Text style={styles.textoVazio}>Nenhum produto forjado ainda.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  headerTitulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 30,
    textAlign: "center",
  },
  cardProduto: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: "row", // Coloca a imagem do lado do texto
    padding: 10,
    elevation: 3, 
  },
  imagem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  imagemVazia: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#D3D3D3",
  },
  infoProduto: {
    marginLeft: 15,
    justifyContent: "center",
  },
  tituloProduto: {
    fontSize: 18,
    fontWeight: "bold",
  },
  precoProduto: {
    fontSize: 16,
    color: "#2E8B57", 
    marginTop: 5,
  },
  textoVazio: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  }
});
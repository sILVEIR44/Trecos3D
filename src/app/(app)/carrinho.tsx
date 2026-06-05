import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { router } from "expo-router";

export default function Carrinho() {
  const { carrinho } = useContext(CartContext);
  const { token } = useContext(AuthContext);
  const [ listaOrcamentos, setListaOrcamentos ] = useState<any[]>([]);
  const [ carregandoOrcamentos, setCarregandoOrcamentos ] = useState(true);

  const buscarMeusOrcamentos = async () => {
    try {
      const urlAPI = `http://192.168.5.235:3000/orcamentos/1`; 

      const resposta = await fetch(urlAPI);
      const dados = await resposta.json();

      setListaOrcamentos(dados);
    } catch (error) {
      console.error("Erro ao buscar orçamentos:", error);
    } finally {
      setCarregandoOrcamentos(false);
    }
  };

  useEffect(() => {
    buscarMeusOrcamentos();
  }, []);

  function renderizarItemCarrinho({ item }: any) {
    return (
      <View style={styles.cardItem}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.imagem} />
        ) : (
          <View style={styles.imagemVazia} />
        )}
        <View style={styles.infoItem}>
          <Text style={styles.tituloItem}>{item.title}</Text>
          <Text style={styles.precoItem}>R$ {item.price}</Text>
          <Text style={styles.quantidadeItem}>Qtd: {item.quantidade}</Text>
        </View>
      </View>
    );
  }

  // Soma o valor total do carrinho
  const totalLoja = carrinho.reduce(( total, item ) => total + ( item.price * item.quantidade ), 0);
  const totalOrcamentos = listaOrcamentos.reduce(( total, item ) => total + Number(item.calculated_price), 0);
  const valorTotal = totalLoja + totalOrcamentos;

  const finalizarPedido = async () => {
    console.log(" O botão Finalizar Pedido foi clicado!");
    console.log("Pulseira (Token) no Carrinho:", token);
    // prevenir que o user envie um pedido fantasma
    if (carrinho.length === 0 && listaOrcamentos.length === 0) {
      alert("Atenção, o seu carrinho está vazio. Adicione itens antes de finalizar.");
      return;
    }
    
    if (!token) {
      alert("Acesso Negado: A pulseira de identificação sumiu! Por favor, faça login novamente.");
      return;
    }

    //  contar as tropas (itens da loja + orçamentos)
    const quantidadeProdutos = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    const quantidadeOrcamentos = listaOrcamentos.length; // Cada orçamento conta como 1 peça
    const totalItens = quantidadeProdutos + quantidadeOrcamentos;

    try {
      //  Use o seu IP atual
      const urlAPI = `http://192.168.5.235:3000/orders`; 

      const resposta = await fetch(urlAPI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          quote_id: null, // como podemos ter x produtos, deixamos null por agora
          total_value: valorTotal,
          item_count: totalItens
        })
      });

      const dados = await resposta.json();
      console.log("Resposta do Castelo (API):", dados);
      console.log("Status da Resposta:", resposta.status);

      if (resposta.ok) {
        alert("Sucesso! O seu pedido foi enviado! \n\n" + dados.message);
        router.replace("/home");
        
      } else {
        alert("Erro, Algo deu errado ao finalizar." + dados.error);
      }

    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
      alert("Erro de Comunicação. Não foi possível enviar o pedido. Tente novamente mais tarde.");
    }
  };

  return (
    <View style={ styles.container }>
      <Text style={ styles.headerTitulo }>Meu Carrinho</Text>
     {/* --- SEÇÃO 1: ITENS DO CARRINHO --- */}
      { carrinho.length === 0 ? (
        <Text style={ styles.textoVazio }>Nenhum item da loja adicionado.</Text>
      ) : (
        <FlatList
          data={ carrinho }
          keyExtractor={(item) => item.id.toString()}
          renderItem={ renderizarItemCarrinho }
          style={{ flexGrow: 0, maxHeight: 220 }} 
        />
      )}

      {/* --- SEÇÃO 2: ORÇAMENTOS 3D --- */}
      <Text style={ styles.tituloSecao }>Meus Orçamentos (Peças 3D)</Text>

      { carregandoOrcamentos ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : listaOrcamentos.length === 0 ? (
        <Text style={ styles.textoVazio }>Nenhum orçamento pendente.</Text>
      ) : (
        <FlatList
          data={ listaOrcamentos }
          keyExtractor={(item) => String(item.id)}
          style={{ flex: 1 }} 
          renderItem={({ item }) => (
            <View style={ styles.cartaoOrcamento }>
              <Image source={{ uri: item.file_url }} style={styles.miniatura} />

              <View style={ styles.detalhesCartao }>
                <Text style={ styles.textoForte }>Material: {item.material}</Text>
                <Text>Peso: { item.estimated_grams }g</Text>
                <Text style={ styles.textoPreco }>Estimativa: R$ {item.calculated_price}</Text>
                
                <View style={[ styles.insigniaStatus, item.status === 'pending' ? styles.statusPendente : styles.statusAprovado]}>
                  <Text style={ styles.textoStatus }>
                    { item.status === 'pending' ? ' Em Avaliação' : ' Aprovado'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* --- SEÇÃO 3: RODAPÉ DE FINALIZAR PEDIDO --- */}
      <View style={ styles.rodape }>
        <Text style={ styles.textoTotal }>Total: R$ { valorTotal.toFixed(2) }</Text>
        <TouchableOpacity style={ styles.botaoFinalizar } onPress={ finalizarPedido }>
          <Text style={ styles.textoBotaoFinalizar }>Finalizar Pedido</Text>
        </TouchableOpacity>
      </View>

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
  textoVazio: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
    fontStyle: 'italic',
  },
  cardItem: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: "row",
    padding: 10,
    elevation: 2,
  },
  imagem: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#E0E0E0",
  },
  imagemVazia: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#D3D3D3",
  },
  infoItem: {
    marginLeft: 15,
    justifyContent: "center",
  },
  tituloItem: {
    fontSize: 16,
    fontWeight: "bold",
  },
  precoItem: {
    fontSize: 14,
    color: "#2E8B57",
    marginTop: 2,
  },
  quantidadeItem: {
    fontSize: 14,
    color: "gray",
    marginTop: 2,
  },
  rodape: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#D3D3D3",
    alignItems: "center",
  },
  textoTotal: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  botaoFinalizar: {
    backgroundColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  textoBotaoFinalizar: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  /* --- NOVOS ESTILOS DOS ORÇAMENTOS ADICIONADOS AQUI --- */
  tituloSecao: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#333',
  },
  cartaoOrcamento: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2, 
  },
  miniatura: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  detalhesCartao: {
    flex: 1,
    justifyContent: 'center',
  },
  textoForte: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  textoPreco: {
    color: '#2E8B57',
    fontWeight: 'bold',
    marginVertical: 2,
  },
  insigniaStatus: {
    marginTop: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusPendente: {
    backgroundColor: '#fff3cd', 
  },
  statusAprovado: {
    backgroundColor: '#d1e7dd', 
  },
  textoStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  }
});
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
    const { token, user, signOut } = useContext(AuthContext);
    const router = useRouter();
    const [ dados, setDados ] = useState<any>(null);
    const [ carregando, setCarregando ] = useState(true);
    
    const carregarDashboard = async () => {
        try {
            const urlAPI = `http://192.168.5.235:3000/dashboard`;

            const resposta = await fetch(urlAPI, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!resposta.ok) throw new Error("Acesso negado!");
            const data = await resposta.json();
            setDados(data.dashboard);

        } catch (error) {
            console.error(error);
            alert("Acesso negado.");
            router.replace("/home")
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        if (user?.role !== 'admin') {
            alert("Acesso Negado: Apenas o Superadmin pode entrar aqui!");
            router.replace("/home");
            return; 
    }
        carregarDashboard();
    }, [user]);

    const sairDoControle = async () => {
        await signOut();
        router.replace("/login");
    };

    if (carregando) {
        return (
            <View style={ styles.centro }>
                <ActivityIndicator size="large" color="#000" />
                <Text style={ styles.textoCarregando }>Quase lá, aguarde um momento...</Text>
            </View>
        );
    }

    return (
      <ScrollView style={styles.container}>
      <View style={styles.cabecalho}>
        <View>
          <Text style={styles.titulo}>Painel do Superadmin</Text>
          <Text style={styles.subtitulo}>Bem-vindo, {user?.name || "Chefe"}</Text>
        </View>
        <TouchableOpacity onPress={sairDoControle} style={styles.botaoSair}>
          <Ionicons name="log-out-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.cartoesContainer}>
        {/* Cartão de Faturamento */}
        <View style={[styles.cartao, { borderLeftColor: '#28A745' }]}>
          <Ionicons name="cash-outline" size={30} color="#28A745" />
          <Text style={styles.cartaoTitulo}>Faturamento Total</Text>
          <Text style={styles.cartaoValor}>R$ {dados?.faturamento_total?.toFixed(2) || "0.00"}</Text>
        </View>

        {/* Cartão de Pedidos */}
        <View style={[styles.cartao, { borderLeftColor: '#007BFF' }]}>
          <Ionicons name="cube-outline" size={30} color="#007BFF" />
          <Text style={styles.cartaoTitulo}>Total de Pedidos</Text>
          <Text style={styles.cartaoValor}>{dados?.total_pedidos || 0}</Text>
        </View>

        {/* Cartão de Orçamentos Pendentes */}
        <View style={[styles.cartao, { borderLeftColor: '#FFC107' }]}>
          <Ionicons name="document-text-outline" size={30} color="#FFC107" />
          <Text style={styles.cartaoTitulo}>Orçamentos Pendentes</Text>
          <Text style={styles.cartaoValor}>{dados?.orcamentos_pendentes || 0}</Text>
        </View>

        {/* Cartão de Vitrine */}
        <View style={[styles.cartao, { borderLeftColor: '#6F42C1' }]}>
          <Ionicons name="pricetags-outline" size={30} color="#6F42C1" />
          <Text style={styles.cartaoTitulo}>Produtos na Vitrine</Text>
          <Text style={styles.cartaoValor}>{dados?.total_produtos_vitrine || 0}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centro: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
},
  textoCarregando: { 
    marginTop: 10, 
    fontSize: 16, 
    color: '#555' 

  },
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5' 

  },
  cabecalho: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#000', 
    padding: 20, 
    paddingTop: 50, 
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20 
  },
  titulo: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#FFF' 

  },
  subtitulo: { 
    fontSize: 14, 
    color: '#AAA', 
    marginTop: 5 

  },
  botaoSair: { 
    backgroundColor: '#333', 
    padding: 10, borderRadius: 10 

  },
  cartoesContainer: { 
    padding: 20, 
    marginTop: 10 

  },
  cartao: { 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderRadius: 12, 
    marginBottom: 15, 
    borderLeftWidth: 5, 
    elevation: 3, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4 
  },
  cartaoTitulo: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 10 

  },
  cartaoValor: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#333', 
    marginTop: 5 

  }
});

 
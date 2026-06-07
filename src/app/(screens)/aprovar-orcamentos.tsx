import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AprovarOrcamentos() {
    const router = useRouter();
    const { token, user } = useContext(AuthContext) as any;

    const [orcamentos, setOrcamentos] = useState<any[]>([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        if (user && user.role !== 'admin' && user.role !== 'superadmin') {
            router.replace('/home');
        }
    }, [user]);

    const buscarPendentes = async () => {
        try {
            const urlDaAPI = `http://192.168.5.235:3000/admin/orcamentos`;
            const resposta = await fetch(urlDaAPI, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!resposta.ok) throw new Error("Falha ao buscar orçamentos");
            const dados = await resposta.json();
            setOrcamentos(dados);
        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "Não foi possível conectar.");
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        buscarPendentes();
    }, []);

    //  (Aprovar ou Rejeitar)
    const despacharOrdem = async (id: number, status: 'approved' | 'rejected') => {
        try {
            const urlDaAPI = `http://192.168.5.235:3000/quotes/${id}/status`;
            const resposta = await fetch(urlDaAPI, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (!resposta.ok) throw new Error("Falha ao executar a ordem");

            Alert.alert("Sucesso!", `O orçamento foi ${status === 'approved' ? 'Aprovado' : 'Rejeitado'} com sucesso!`);
            
            // Remove da lista o orçamento
            setOrcamentos((listaAtual) => listaAtual.filter((item) => item.id !== id));

        } catch (error) {
            console.error(error);
            Alert.alert("Erro", "O mensageiro falhou ao entregar a ordem.");
        }
    };

    if (carregando) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator size="large" color="#FFC107" />
                <Text style={styles.textoCarregando}>Buscando os pergaminhos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.cabecalho}>
                <TouchableOpacity onPress={() => router.back()} style={styles.botaoVoltar}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.titulo}>Gerir Orçamentos</Text>
            </View>

            {orcamentos.length === 0 ? (
                <View style={styles.vazio}>
                    <Ionicons name="checkmark-done-circle-outline" size={60} color="#28A745" />
                    <Text style={styles.textoVazio}>O sistema está em dia.</Text>
                    <Text style={styles.subTextoVazio}>Não há orçamentos pendentes.</Text>
                </View>
            ) : (
                <FlatList
                    data={orcamentos}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.lista}
                    renderItem={({ item }: { item: any}) => (
                        <View style={styles.cartao}>
                            <View style={styles.cartaoTopo}>
                                <Image source={{ uri: item.file_url }} style={styles.imagem} />
                                <View style={styles.info}>
                                    <Text style={styles.infoTexto}><Text style={styles.negrito}>Usuário ID:</Text> {item.user_id}</Text>
                                    <Text style={styles.infoTexto}><Text style={styles.negrito}>Material:</Text> {item.material}</Text>
                                    <Text style={styles.infoTexto}><Text style={styles.negrito}>Peso (g):</Text> {item.estimated_grams}</Text>
                                    <Text style={styles.preco}>R$ {Number(item.calculated_price).toFixed(2)}</Text>
                                </View>
                            </View>

                            <View style={styles.cartaoAcoes}>
                                <TouchableOpacity 
                                    style={[styles.botao, styles.botaoRejeitar]}
                                    onPress={() => despacharOrdem(item.id, 'rejected')}
                                >
                                    <Ionicons name="close-circle-outline" size={20} color="#FFF" />
                                    <Text style={styles.textoBotao}>Rejeitar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={[styles.botao, styles.botaoAprovar]}
                                    onPress={() => despacharOrdem(item.id, 'approved')}
                                >
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                                    <Text style={styles.textoBotao}>Aprovar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    centro: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#F5F5F5' 

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
        alignItems: 'center', 
        backgroundColor: '#000', 
        padding: 20, 
        paddingTop: 50, 
        borderBottomLeftRadius: 20, 
        borderBottomRightRadius: 20 
    },

    botaoVoltar: { 
        marginRight: 15 
    },

    titulo: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: '#FFF' 
    },

    lista: { 
        padding: 15 
    },

    vazio: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },

    textoVazio: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#333', 
        marginTop: 10 
    },

    subTextoVazio: { 
        fontSize: 14, 
        color: '#777', 
        marginTop: 5 
    },

    cartao: { 
        backgroundColor: '#FFF', 
        borderRadius: 12, 
        padding: 15, 
        marginBottom: 15, 
        elevation: 3 
    },

    cartaoTopo: { 
        flexDirection: 'row', 
        marginBottom: 15 
    },

    imagem: { 
        width: 80, 
        height: 80, 
        borderRadius: 8, 
        backgroundColor: '#EEE' 
    },

    info: { 
        flex: 1, 
        marginLeft: 15, 
        justifyContent: 'center' 
    },

    infoTexto: { 
        fontSize: 14, 
        color: '#555', 
        marginBottom: 2 
    },

    negrito: { 
        fontWeight: 'bold', 
        color: '#333' 
    },

    preco: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#9810FA', 
        marginTop: 5 
    },

    cartaoAcoes: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        gap: 10 
    },

    botao: { 
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingVertical: 10, 
        borderRadius: 8, 
        gap: 5 
    }, 

    botaoRejeitar: { 
        backgroundColor: '#DC3545'
    },

    botaoAprovar: { 
        backgroundColor: '#28A745' 
    },

    textoBotao: { 
        color: '#FFF', 
        fontWeight: 'bold', 
        fontSize: 15 
    }
});
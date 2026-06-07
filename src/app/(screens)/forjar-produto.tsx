import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import api from '../../services/authService';

export default function ForjarProduto() {
    const router = useRouter();
    const { token, user } = useContext(AuthContext) as any;

    useEffect(() => {
        if (user && user.role !== 'admin' && user.role !== 'superadmin') {
            router.replace('/home');
        }
    }, [user]);

    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    const [preco, setPreco] = useState('');
    const [estoque, setEstoque] = useState('');
    const [imagem, setImagem] = useState('');
    const [relatorio, setRelatorio] = useState('');

    const forjarNovoProduto = async () => {
        setRelatorio("Preparando...")
        if (!titulo || !preco) {
            setRelatorio("Titulo e preço ta faltando...")
            Alert.alert("Atenção", "O título e o preço são obrigatórios para a vitrine!");
            return;
        }
        setRelatorio("Enviando dados pro server...")
        try {
            const resposta = await api.post('/products', {
                title: titulo,
                description: descricao,
                price: parseFloat(preco.replace(',', '.')),
                stock: parseInt(estoque) || 0,
                image_url: imagem
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setRelatorio("Sucesso...")
            Alert.alert("Sucesso!", "O novo produto foi adicionado à vitrine da Loja 3D!");
            router.back(); 

        } catch (error: any) {
            Alert.alert("Erro", "Falha na criação. Verifique as credenciais ou a conexão com o servidor.");
            const erroReal = error.response?.data?.error || error.message;
            setRelatorio(`Erro: ${erroReal}`);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.cabecalho}>
                <TouchableOpacity onPress={() => router.back()} style={styles.botaoVoltar}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.titulo}>Adicionar Produto</Text>
            </View>

            <ScrollView contentContainerStyle={styles.formulario}>
                <View style={styles.grupoInput}>
                    <Text style={styles.label}>Nome do produto *</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Ex: Dragão Articulado 3D" 
                        value={titulo} 
                        onChangeText={setTitulo} 
                    />
                </View>

                <View style={styles.grupoInput}>
                    <Text style={styles.label}>Preço</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Ex: 45.50" 
                        keyboardType="numeric" 
                        value={preco} 
                        onChangeText={setPreco} 
                    />
                </View>

                <View style={styles.grupoInput}>
                    <Text style={styles.label}>Estoque Inicial</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Ex: 10" 
                        keyboardType="numeric" 
                        value={estoque} 
                        onChangeText={setEstoque} 
                    />
                </View>

                <View style={styles.grupoInput}>
                    <Text style={styles.label}>URL da Imagem</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Link direto para a foto (.jpg ou .png)" 
                        value={imagem} 
                        onChangeText={setImagem} 
                    />
                </View>

                <View style={styles.grupoInput}>
                    <Text style={styles.label}>Descrição Completa</Text>
                    <TextInput 
                        style={[styles.input, styles.inputArea]} 
                        placeholder="Detalhes sobre o material, tamanho, etc." 
                        multiline
                        numberOfLines={4}
                        value={descricao} 
                        onChangeText={setDescricao} 
                    />
                </View>

                <TouchableOpacity style={styles.botaoForjar} onPress={forjarNovoProduto}>
                    <Ionicons name="flame" size={20} color="#FFF" />
                    <Text style={styles.textoBotaoForjar}>Adicionar à Vitrine</Text>
                </TouchableOpacity>
                
                {relatorio !== '' && (
                    <View style={styles.caixaRelatorio}>
                        <Text style={styles.textoRelatorio}>{relatorio}</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    cabecalho: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#000', 
        padding: 20, 
        paddingTop: 50, 
        borderBottomLeftRadius: 20, 
        borderBottomRightRadius: 20 
    },
    botaoVoltar: { marginRight: 15 },
    titulo: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
    formulario: { padding: 20 },
    grupoInput: { marginBottom: 15 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#444', marginBottom: 5 },
    input: { 
        backgroundColor: '#FFF', 
        borderWidth: 1, 
        borderColor: '#DDD', 
        borderRadius: 8, 
        paddingHorizontal: 15, 
        height: 50, 
        fontSize: 15 
    },
    inputArea: { height: 100, textAlignVertical: 'top', paddingTop: 15 },
    botaoForjar: { 
        backgroundColor: '#6F42C1', 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingVertical: 15, 
        borderRadius: 8, 
        marginTop: 10,
        gap: 8,
        elevation: 3 
    },
    textoBotaoForjar: { 
        color: '#FFF', 
        fontWeight: 'bold', 
        fontSize: 16 
    },
    caixaRelatorio: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#FFE5E5',
        borderLeftWidth: 5,
        borderLeftColor: '#D8000C',
        borderRadius: 5,
    },
    textoRelatorio: {
        color: '#D8000C',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center'
    }
});
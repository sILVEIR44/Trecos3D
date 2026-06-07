import React, { useState, useContext } from 'react';
import api from '../../services/authService';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, Platform, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../context/AuthContext';

export default function Orcamento() {
  const { user } = useContext(AuthContext) as any;
  const [imagem, setImagem] = useState<string | null>(null);
  const [tamanho, setTamanho] = useState('');
  const [material, setMaterial] = useState('');  
  const [qualidade, setQualidade] = useState('Padrão');

  const escolherImagem = async () => {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissao.status !== 'granted') {
      Alert.alert('Atenção', 'Precisamos de permissão para acessar as suas fotos!');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!resultado.canceled) {
      setImagem(resultado.assets[0].uri);
    }
  };

  const tirarFoto = async () => {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();

    if (permissao.status !== 'granted') {
      Alert.alert('Acesso Negado', 'Precisamos de permissão para acessar a câmera!');
      return;
    }

    // Abre a camera do dispo
    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, //so fotos
      allowsEditing: true, //deixa o user cortar a foto depois de tirar
      aspect: [4, 3], // proporção da foto
      quality: 0.8, // qualidade boa
    });
    
    //senao cancelou e tirou foto, salva o estado
    if (!resultado.canceled) { 
      setImagem(resultado.assets[0].uri);
    }
  };

  // Regra de precificacao simples baseada nas escolhas do user
  const calcularPreco = () => {
    let precoBase = 0;
    
    // tamanho define o preco base
    if (tamanho === 'Pequeno') precoBase = 25;
    else if (tamanho === 'Médio') precoBase = 60;
    else if (tamanho === 'Grande') precoBase = 120;

    // qualidade atua como um multiplicador
    let multiplicador = 1;
    if (qualidade === 'Rascunho') multiplicador = 0.8; 
    else if (qualidade === 'Padrão') multiplicador = 1.2; 
    else if (qualidade === 'Alta') multiplicador = 1.8; 

    const valorFinal = precoBase * multiplicador;
    return valorFinal.toFixed(2).replace('.', ','); // Formata para real
  };

  const enviarOrcamento = async () => {
    if (!imagem) {
      Alert.alert('Atenção', 'Precisamos de uma imagem da peça!');
      return;
    }

    try {
      const pacote = new FormData();
      if (Platform.OS === 'web') {
        //pra rodar na web, expo go ta falhando toda hora...
        const respostaImg = await fetch(imagem);
        const blob = await respostaImg.blob();
        pacote.append('file', blob, 'imagem_orcamento.jpg'); 
      } else {
        // pra rodar no celular, expo go funciona normal
        const nomeArquivo = imagem.split('/').pop() || 'imagem.jpg';
        const tipo = `image/${nomeArquivo.split('.').pop()}`;
        // @ts-ignore - O TypeScript não gosta deste formato, mas o React Native precisa dele
        pacote.append('file', {
          uri: imagem,
          name: nomeArquivo,
          type: tipo,
        });
      }
        
      let gramas = 50;
      if (tamanho === 'Médio') gramas = 150;
      if (tamanho === 'Grande') gramas = 300;

      const valorFinal = parseFloat(calcularPreco().replace(',', '.'));

      // adiciona os textos ao pacote
      pacote.append('material', material || 'PLA');
      pacote.append('estimated_grams', String(gramas));
      pacote.append('calculated_price', String(valorFinal));
      pacote.append('user_id', String(user?.id || 1));

      // dispara o pacote para API
      const resposta = await api.post('/orcamentos', pacote, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Sucesso!', 'O orçamento foi enviado com sucesso!');
      
      // limpa 
      setImagem(null);
      setTamanho('');
      setMaterial('');

    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível enviar o orçamento. Tente novamente.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>Novo Orçamento 3D</Text>
      <Text style={styles.subtitulo}>Responda a duas perguntas simples e descubra o valor na hora.</Text>

      {/* 1. Imagem */}
      <View style={styles.areaImagem}>
        {imagem ? (
          <Image source={{ uri: imagem }} style={styles.imagemEscolhida} />
        ) : (
          <Text style={styles.textoSemImagem}>Nenhuma imagem selecionada</Text>
        )}
      </View>
      <TouchableOpacity style={styles.botaoCamera} onPress={escolherImagem}>
        <Text style={styles.textoBotao}> Anexar Imagem</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity style={styles.botaoCamera} onPress={tirarFoto}>
        <Text style={styles.textoBotao}> Tirar Foto Agora</Text>
      </TouchableOpacity> */}
      
      {/* Perguntas */}
      <View style={styles.secaoPerguntas}>
        <Text style={styles.labelPergunta}>1. Qual o tamanho aproximado? (tamanho em cm)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 10x5x3"
          placeholderTextColor="#999"
          value={tamanho}
          onChangeText={setTamanho}
        />

        <Text style={styles.labelPergunta}>2. Qual o material que você quer usar?</Text>
        <TextInput
          style={styles.input}
          placeholder="Material padrão"
          placeholderTextColor="#999"
          value={material}
          onChangeText={setMaterial}
        />
      </View>

      {/* botao de envio */}
      <TouchableOpacity style={styles.botaoEnviar} onPress={enviarOrcamento}>
        <Text style={styles.textoBotao}>Solicitar Orçamento</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5'
  },
  content: { 
    padding: 20, 
    alignItems: 'center', 
    paddingBottom: 40 
  },
  titulo: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 5, 
    marginTop: 10 
  },
  subtitulo: { 
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25 
  },
  areaImagem: { 
    width: '100%', 
    height: 180, 
    backgroundColor: '#E8E8E8', 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15, 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: '#CCC', 
    borderStyle: 'dashed' 
  },
  imagemEscolhida: { 
    width: '100%', 
    height: '100%' 
  },
  textoSemImagem: { 
    color: '#999' 
  },
  botaoCamera: { 
    backgroundColor: '#555', 
    padding: 12, 
    borderRadius: 8, 
    width: '100%', 
    alignItems: 'center', 
    marginBottom: 10 // Reduzi um pouco o espaçamento para caberem os dois botões elegantemente
  },
  secaoPerguntas: {
    width: '100%', 
    marginBottom: 20,
    marginTop: 10
  },
  labelPergunta: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#444', 
    marginBottom: 10, 
    marginTop: 10 
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  botaoEnviar: { 
    backgroundColor: '#000', 
    padding: 18,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center' 
  },
  textoBotao: { 
    color: '#FFF', 
    fontWeight: 'bold',
    fontSize: 16 
  },
});
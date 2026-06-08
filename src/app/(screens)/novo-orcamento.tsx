import React, { useState, useContext } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ScrollView, Alert, Platform, ActivityIndicator, TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/authService";

const MATERIAIS = ["PLA", "ABS", "PETG"];
const TAMANHOS: { label: string; gramas: number; horas: number }[] = [
  { label: "Pequeno",  gramas: 50,  horas: 2 },
  { label: "Médio",   gramas: 150, horas: 5 },
  { label: "Grande",  gramas: 300, horas: 10 },
];
const PRECO_POR_GRAMA: Record<string, number> = { PLA: 0.50, ABS: 0.40, PETG: 0.60 };
const CUSTO_POR_HORA = 5.0;

function calcularPreco(material: string, gramas: number, horas: number) {
  return gramas * (PRECO_POR_GRAMA[material] ?? 0.50) + horas * CUSTO_POR_HORA;
}

export default function NovoOrcamento() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useContext(AuthContext) as any;
  const { colors, isDark } = useTheme();

  const [imagem, setImagem] = useState<string | null>(null);
  const [materialSelecionado, setMaterialSelecionado] = useState("PLA");
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<(typeof TAMANHOS)[0] | null>(null);
  const [whatsapp, setWhatsapp] = useState("");
  const [enviando, setEnviando] = useState(false);

  function formatarTelefone(valor: string) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    if (numeros.length <= 2) return `(${numeros}`;
    if (numeros.length <= 7) return `(${numeros.slice(0,2)}) ${numeros.slice(2)}`;
    if (numeros.length <= 10) return `(${numeros.slice(0,2)}) ${numeros.slice(2,6)}-${numeros.slice(6)}`;
    return `(${numeros.slice(0,2)}) ${numeros.slice(2,7)}-${numeros.slice(7)}`;
  }

  const precoEstimado =
    tamanhoSelecionado
      ? calcularPreco(materialSelecionado, tamanhoSelecionado.gramas, tamanhoSelecionado.horas)
      : null;

  async function escolherImagem() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissao.status !== "granted") {
      Alert.alert("Atenção", "Precisamos de permissão para acessar as suas fotos!");
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.9,
    });
    if (!resultado.canceled) setImagem(resultado.assets[0].uri);
  }

  async function tirarFoto() {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (permissao.status !== "granted") {
      Alert.alert("Acesso Negado", "Precisamos de permissão para acessar a câmera!");
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'] as any,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!resultado.canceled) setImagem(resultado.assets[0].uri);
  }

  async function enviarOrcamento() {
    if (!imagem) {
      Alert.alert("Atenção", "Adicione uma foto da peça antes de enviar.");
      return;
    }
    if (!tamanhoSelecionado) {
      Alert.alert("Atenção", "Selecione o tamanho aproximado da peça.");
      return;
    }
    if (!whatsapp.trim()) {
      Alert.alert("Atenção", "Informe seu WhatsApp para entrarmos em contato.");
      return;
    }

    setEnviando(true);
    try {
      const preco = calcularPreco(materialSelecionado, tamanhoSelecionado.gramas, tamanhoSelecionado.horas);
      const pacote = new FormData();

      if (imagem) {
        if (Platform.OS === "web") {
          const resp = await fetch(imagem);
          const blob = await resp.blob();
          pacote.append("file", blob, "orcamento.jpg");
        } else {
          const nome = imagem.split("/").pop() ?? "orcamento.jpg";
          const ext = nome.split(".").pop();
          pacote.append("file", { uri: imagem, name: nome, type: `image/${ext}` } as any);
        }
      }

      pacote.append("material", materialSelecionado);
      pacote.append("estimated_grams", String(tamanhoSelecionado.gramas));
      pacote.append("calculated_price", String(preco.toFixed(2)));
      pacote.append("user_id", String(user?.id ?? 1));
      pacote.append("phone", whatsapp.trim());
      pacote.append("tamanho", tamanhoSelecionado.label);

      const resposta = await api.post("/orcamentos", pacote, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!resposta.data) throw new Error("Falha na API.");

      Alert.alert(
        "Orçamento Enviado! ✓",
        `Recebemos sua solicitação.\nValor estimado: R$ ${preco.toFixed(2)}\n\nEntraremos em contato pelo WhatsApp informado.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
      setImagem(null);
      setTamanhoSelecionado(null);
      setWhatsapp("");
    } catch {
      Alert.alert("Erro", "Não foi possível enviar o orçamento. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.conteudo}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnVoltar}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitulo}>Novo Orçamento 3D</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.corpo}>
        <Text style={[styles.secaoTitulo, { color: colors.text }]}>Foto da Peça</Text>
        <TouchableOpacity
          style={[styles.areaImagem, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={escolherImagem}
          activeOpacity={0.8}
        >
          {imagem ? (
            <Image source={{ uri: imagem }} style={styles.imagemEscolhida} />
          ) : (
            <View style={styles.imagemPlaceholder}>
              <Ionicons name="camera-outline" size={40} color={colors.subtext} />
              <Text style={[styles.imagemPlaceholderTexto, { color: colors.subtext }]}>
                Toque para adicionar uma foto
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.botoesImagem}>
          <TouchableOpacity
            style={[styles.btnImagem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={escolherImagem}
          >
            <Ionicons name="images-outline" size={18} color="#9810FA" />
            <Text style={[styles.btnImagemTexto, { color: colors.text }]}>Galeria</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnImagem, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={tirarFoto}
          >
            <Ionicons name="camera-outline" size={18} color="#9810FA" />
            <Text style={[styles.btnImagemTexto, { color: colors.text }]}>Câmera</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.secaoTitulo, { color: colors.text }]}>Material</Text>
        <View style={styles.chips}>
          {MATERIAIS.map(mat => {
            const ativo = mat === materialSelecionado;
            return (
              <TouchableOpacity
                key={mat}
                style={[
                  styles.chip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  ativo && styles.chipAtivo,
                ]}
                onPress={() => setMaterialSelecionado(mat)}
              >
                <Text style={[styles.chipTexto, { color: colors.subtext }, ativo && styles.chipTextoAtivo]}>
                  {mat}
                </Text>
                {ativo && (
                  <Text style={[styles.chipPreco, { color: "rgba(255,255,255,0.8)" }]}>
                    R${PRECO_POR_GRAMA[mat].toFixed(2)}/g
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.secaoTitulo, { color: colors.text }]}>Tamanho Aproximado</Text>
        <View style={styles.tamanhos}>
          {TAMANHOS.map(t => {
            const ativo = tamanhoSelecionado?.label === t.label;
            const preco = calcularPreco(materialSelecionado, t.gramas, t.horas);
            return (
              <TouchableOpacity
                key={t.label}
                style={[
                  styles.tamanhoCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  ativo && styles.tamanhoCardAtivo,
                ]}
                onPress={() => setTamanhoSelecionado(t)}
              >
                <Text style={[styles.tamanhoLabel, { color: colors.text }, ativo && { color: "white" }]}>
                  {t.label}
                </Text>
                <Text style={[styles.tamanhoGramas, ativo ? { color: "rgba(255,255,255,0.8)" } : { color: colors.subtext }]}>
                  ~{t.gramas}g
                </Text>
                <Text style={[styles.tamanhoPrecio, ativo ? { color: "white" } : { color: "#9810FA" }]}>
                  R$ {preco.toFixed(2)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {precoEstimado !== null && (
          <View style={[styles.precoCard, { backgroundColor: "#9810FA11", borderColor: "#9810FA33" }]}>
            <Ionicons name="calculator-outline" size={22} color="#9810FA" />
            <View style={styles.precoInfo}>
              <Text style={[styles.precoLabel, { color: colors.subtext }]}>Estimativa de custo</Text>
              <Text style={styles.precoValor}>R$ {precoEstimado.toFixed(2)}</Text>
            </View>
            <Text style={[styles.precoObs, { color: colors.subtext }]}>
              Valor sujeito a revisão pelo Admin
            </Text>
          </View>
        )}

        <Text style={[styles.secaoTitulo, { color: colors.text }]}>WhatsApp para Contato</Text>
        <View style={[styles.inputBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          <TextInput
            style={[styles.inputTexto, { color: colors.text }]}
            placeholder="(11) 99999-9999"
            placeholderTextColor={colors.placeholder}
            value={whatsapp}
            onChangeText={(v) => setWhatsapp(formatarTelefone(v))}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.botaoEnviar, enviando && { opacity: 0.6 }]}
          onPress={enviarOrcamento}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="send-outline" size={20} color="white" />
              <Text style={styles.botaoEnviarTexto}>Solicitar Orçamento</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  conteudo: { paddingBottom: 40 },

  header: {
    backgroundColor: "#9810FA",
    paddingBottom: 20, paddingHorizontal: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  btnVoltar: { padding: 4 },
  headerTitulo: { color: "white", fontSize: 18, fontWeight: "bold" },

  corpo: { padding: 16 },

  secaoTitulo: { fontSize: 13, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 24, marginBottom: 10 },

  areaImagem: {
    width: "100%", height: 200, borderRadius: 14,
    borderWidth: 1.5, borderStyle: "dashed",
    overflow: "hidden", marginBottom: 10,
  },
  imagemEscolhida: { width: "100%", height: "100%" },
  imagemPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  imagemPlaceholderTexto: { fontSize: 14 },

  botoesImagem: { flexDirection: "row", gap: 10, marginBottom: 4 },
  btnImagem: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1,
  },
  btnImagemTexto: { fontSize: 14, fontWeight: "bold" },

  chips: { flexDirection: "row", gap: 10 },
  chip: {
    flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1,
    alignItems: "center",
  },
  chipAtivo: { backgroundColor: "#9810FA", borderColor: "#9810FA" },
  chipTexto: { fontSize: 14, fontWeight: "bold" },
  chipTextoAtivo: { color: "white" },
  chipPreco: { fontSize: 11, marginTop: 2 },

  tamanhos: { flexDirection: "row", gap: 10 },
  tamanhoCard: {
    flex: 1, paddingVertical: 14, borderRadius: 12,
    borderWidth: 1, alignItems: "center", gap: 2,
  },
  tamanhoCardAtivo: { backgroundColor: "#9810FA", borderColor: "#9810FA" },
  tamanhoLabel: { fontSize: 15, fontWeight: "bold" },
  tamanhoGramas: { fontSize: 11 },
  tamanhoPrecio: { fontSize: 13, fontWeight: "bold", marginTop: 4 },

  precoCard: {
    marginTop: 20, borderRadius: 14, borderWidth: 1,
    padding: 16, flexDirection: "row", alignItems: "center", gap: 12,
    flexWrap: "wrap",
  },
  precoInfo: { flex: 1 },
  precoLabel: { fontSize: 12 },
  precoValor: { fontSize: 22, fontWeight: "bold", color: "#9810FA" },
  precoObs: { fontSize: 11, width: "100%", marginTop: 4 },

  inputBox: {
    flexDirection: "row", alignItems: "center", gap: 10,
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 12, marginTop: 8,
  },
  inputTexto: { flex: 1, fontSize: 15 },

  botaoEnviar: {
    backgroundColor: "#9810FA", flexDirection: "row", alignItems: "center",
    justifyContent: "center", paddingVertical: 16, borderRadius: 14,
    gap: 10, marginTop: 24, elevation: 3,
  },
  botaoEnviarTexto: { color: "white", fontWeight: "bold", fontSize: 16 },
});

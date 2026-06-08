import React, { useContext, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ScrollView, Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

function nomeRole(role?: string) {
  if (role === "admin") return "Admin"
  if (role === "superadmin") return "Superadmin"
  return "Usuário"
}

export default function Perfil() {
  const router = useRouter();
  const { user, signOut } = useContext(AuthContext) as any;
  const { isDark, toggleTheme, colors } = useTheme();

  function realizarLogout() {
    router.replace("/login");
    setTimeout(() => signOut(), 300);
  }

  function confirmarSaida() {
    Alert.alert("Fazer Logout", "Tem certeza que deseja sair?", [
      { text: "Ficar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: realizarLogout },
    ]);
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.conteudo}
    >
      <View style={styles.cabecalho}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarLetra}>
            {(user?.name ?? "U").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.nome}>{user?.name ?? "Usuário"}</Text>
        <Text style={styles.email}>{user?.email ?? ""}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeTexto}>{nomeRole(user?.role)}</Text>
        </View>
      </View>

      <Text style={[styles.secaoTitulo, { color: colors.subtext }]}>Compras</Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.linhaCard, { borderBottomColor: colors.divider }]}
          onPress={() => router.push("/(app)/meus-pedidos" as any)}
        >
          <View style={styles.linhaEsquerda}>
            <Ionicons name="receipt-outline" size={20} color="#9810FA" />
            <Text style={[styles.linhaTexto, { color: colors.text }]}>Meus Pedidos</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.border} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.linhaCard, { borderBottomWidth: 0 }]}
          onPress={() => router.push("/(screens)/meus-orcamentos" as any)}
        >
          <View style={styles.linhaEsquerda}>
            <Ionicons name="cube-outline" size={20} color="#9810FA" />
            <Text style={[styles.linhaTexto, { color: colors.text }]}>Meus Orçamentos</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.border} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.secaoTitulo, { color: colors.subtext }]}>Segurança</Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.linhaCard, { borderBottomColor: colors.divider }]}
          onPress={() =>
            Alert.alert("Alterar Senha", "Funcionalidade disponível em breve.", [{ text: "OK" }])
          }
        >
          <View style={styles.linhaEsquerda}>
            <Ionicons name="lock-closed-outline" size={20} color="#9810FA" />
            <Text style={[styles.linhaTexto, { color: colors.text }]}>Alterar Senha</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.border} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.secaoTitulo, { color: colors.subtext }]}>Preferências</Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={[styles.linhaCard, { borderBottomWidth: 0 }]}>
          <View style={styles.linhaEsquerda}>
            <Ionicons name="moon-outline" size={20} color="#9810FA" />
            <Text style={[styles.linhaTexto, { color: colors.text }]}>Modo Escuro</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#E0E0E0", true: "#C4B5FD" }}
            thumbColor={isDark ? "#9810FA" : "#FFF"}
          />
        </View>
      </View>

      <Text style={[styles.secaoTitulo, { color: colors.subtext }]}>Suporte</Text>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.linhaCard, { borderBottomWidth: 0 }]}
          onPress={() =>
            Alert.alert(
              "Fale com o Desenvolvedor",
              "Entre em contato pelo e-mail:\nsuporte@trecos3d.com",
              [{ text: "OK" }]
            )
          }
        >
          <View style={styles.linhaEsquerda}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#9810FA" />
            <Text style={[styles.linhaTexto, { color: colors.text }]}>Fale com o Desenvolvedor</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.border} />
        </TouchableOpacity>
      </View>

      <View style={styles.rodape}>
        <TouchableOpacity style={styles.botaoSair} onPress={confirmarSaida}>
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.botaoSairTexto}>Fazer Logout</Text>
        </TouchableOpacity>
        <Text style={[styles.versao, { color: colors.subtext }]}>v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  conteudo: { paddingBottom: 40 },

  cabecalho: {
    backgroundColor: "#9810FA",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 32,
    gap: 4,
  },
  avatarBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 8,
  },
  avatarLetra: { fontSize: 36, fontWeight: "bold", color: "white" },
  nome: { fontSize: 22, fontWeight: "bold", color: "white" },
  email: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  badge: {
    marginTop: 8, backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20,
  },
  badgeTexto: { color: "white", fontWeight: "bold", fontSize: 13 },

  secaoTitulo: {
    fontSize: 12, fontWeight: "bold",
    textTransform: "uppercase", letterSpacing: 1,
    marginTop: 24, marginBottom: 8, marginHorizontal: 16,
  },
  card: {
    borderRadius: 14, marginHorizontal: 16,
    overflow: "hidden", elevation: 1,
  },
  linhaCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 15,
    borderBottomWidth: 1,
  },
  linhaEsquerda: { flexDirection: "row", alignItems: "center", gap: 12 },
  linhaTexto: { fontSize: 15 },

  rodape: {
    marginTop: 36, marginHorizontal: 16, alignItems: "center", gap: 14,
  },
  botaoSair: {
    backgroundColor: "#9810FA", flexDirection: "row", alignItems: "center",
    justifyContent: "center", paddingVertical: 14, borderRadius: 12,
    gap: 10, elevation: 3, width: "100%",
  },
  botaoSairTexto: { color: "white", fontWeight: "bold", fontSize: 16 },
  versao: { fontSize: 13 },
});

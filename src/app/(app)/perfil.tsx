import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";

export default function Perfil() {
  const router = useRouter();
  const { user, signOut } = useContext(AuthContext) as any;

  const realizarLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  function confirmarSaida() {
    Alert.alert(
      "Sair",
      "Deseja mesmo sair?",
      [
        { text: "Não", style: "cancel" },
        { text: "Sim", style: "destructive", onPress: realizarLogout },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={100} color="#9810FA" />
        <Text style={styles.nome}>{user?.name ?? "Usuário"}</Text>
        <Text style={styles.email}>{user?.email ?? ""}</Text>
        
        <View style={styles.badgeRole}>
          <Text style={styles.badgeTexto}>
            {user?.role === 'admin' ? "Administrador" : "Cliente"}
          </Text>
        </View>
      </View>

      {/* Meus Pedidos */}
      <TouchableOpacity style={styles.botaoPedidos} onPress={() => router.push("/(app)/meus-pedidos" as any)}>
        <Ionicons name="receipt-outline" size={22} color="#9810FA" />
        <Text style={styles.botaoPedidosTexto}>Meus Pedidos</Text>
        <Ionicons name="chevron-forward" size={18} color="#9810FA" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoSair} onPress={confirmarSaida}>
        <Ionicons name="log-out-outline" size={22} color="white" />
        <Text style={styles.botaoSairTexto}>Fazer Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
  },
  nome: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222",
    marginTop: 12,
  },
  email: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  badgeRole: {
    marginTop: 10,
    backgroundColor: "#E9D4FF",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeTexto: {
    color: "#9810FA",
    fontWeight: "bold",
    fontSize: 13,
    textTransform: "capitalize",
  },
  botaoPedidos: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: "80%",
    marginBottom: 16,
    elevation: 2,
    gap: 10,
  },
  botaoPedidosTexto: {
    flex: 1,
    color: "#222",
    fontWeight: "bold",
    fontSize: 15,
  },
  botaoSair: {
    backgroundColor: "#9810FA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    gap: 10,
    width: "80%",
    elevation: 3,
  },
  botaoSairTexto: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
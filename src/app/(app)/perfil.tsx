import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Perfil() {
  const router = useRouter();

  async function realizarLogout() {
    try {
      //  esvazia o baú (remove o token)
      await AsyncStorage.removeItem('@token');
      
      //  escoltado de volta para fora  (Login)
      router.replace("/login");
    } catch (error) {
      console.log("Erro ao sair: ", error);
      Alert.alert("Erro", "As engrenagens do sistema falharam ao tentar fechar os portões.");
    }
  }

  function confirmarSaida() {
    if (Platform.OS === "web") {
        const querSair = window.confirm("Tem certeza que deseja sair?");
        if (querSair) {
            realizarLogout();
        }
  } else {
    Alert.alert(
      "Fazer Logout",
      "Tem a certeza que deseja fazer logout?",
      [
        { text: "Ficar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: realizarLogout }
      ]
    );
  }
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={100} color="black" />
        <Text style={styles.nomeUsuario}>Thawan Oliveira</Text>
        <Text style={styles.titulo}>Escravo</Text>
      </View>

      <View style={styles.menu}>
        {/* O Botão de Fuga */}
        <TouchableOpacity style={styles.botaoSair} onPress={confirmarSaida}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.textoBotaoSair}>Fazer Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  nomeUsuario: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 10,
  },
  titulo: {
    fontSize: 16,
    color: "gray",
    marginTop: 5,
  },
  menu: {
    width: "100%",
    alignItems: "center",
  },
  botaoSair: {
    backgroundColor: "#8B0000", 
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    gap: 10,
    width: "80%",
    justifyContent: "center",
    elevation: 3,
  },
  textoBotaoSair: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
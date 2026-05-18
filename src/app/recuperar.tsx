import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { theme } from "@/theme";
import { Text } from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";
import { Botao } from "@/components/Buttom/button";

export default function Recuperar() {
  const router = useRouter();

  const [email, setEmail] = useState("");

  const [senha, setSenha] = useState("");

  function handleNavigateRegister() {
    router.push("/register");
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        <View style={styles.header}>
          <View style={styles.icon}>
            <Ionicons name="cube-outline" size={30} color="white" />
          </View>
          <Text style={styles.titulo}>Recuperar Senha</Text>
        </View>
        <View style={styles.mid}>
          <Text style={styles.txt}>Digite seu email para enviar o link de recuperação</Text>
          <View style={styles.input}>
            <TextInput
              placeholder="Email"
              onChangeText={setEmail}
              value={email}
            ></TextInput>
          </View>
        </View>
        <View style={styles.botao}>
          <Botao
            titulo="Enviar"
            color="white"
            border={2}
            borderColor="black"
            backgroundColor={"black"}
          ></Botao>
          
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  box: {
    borderWidth: 2,
    width: "100%",
    height: "45%",
    alignItems: "center",
    gap: 20,
  },
  icon: {
    backgroundColor: "black",
    padding: 10,
    borderRadius: 999,
    marginVertical: 15,
    width: "100%",
  },
  header: {
    alignItems: "center",
  },
  titulo: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.xl,
  },
  mid: {
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 2,
    width: "100%",
    height: 40,
    marginTop: 10,
    borderRadius: 8,
    borderColor: theme.colors.cinzaClaro,
    backgroundColor: theme.colors.grey1,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  txt: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.sm,
    paddingTop: 20,
  },
  botao: {
    width: "100%",
    paddingHorizontal: 10,
    paddingTop: 20,
  },
 
});

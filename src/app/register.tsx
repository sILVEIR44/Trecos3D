import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { theme } from "@/theme";
import { Text } from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";
import { Botao } from "@/components/Buttom/button";
import { goBack } from "expo-router/build/global-state/routing";
import api from "../services/authService";

export default function Login() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");

  async function handleRegister() {
    //verifica se ta preenchido
    if (!nome || !email || !senha) {
      alert("Atenção! Preencha todos os campos do pergaminho.");
      return;
    }
    // verifica se as senhas tao iguais
    if (senha !== confirmaSenha) {
      alert("As senhas não coincidem.");
      return;
    }
    try {
      //envia pro servidor
      const response = await api.post('/register', {
        name: nome,
        email: email,
        password: senha
      });
      alert("Usuário criado com sucesso!");
      setNome("");
      setEmail("");
      setSenha("");
      setConfirmaSenha("");
      
      //vai pra tela de login agora
      router.replace("/login");

    } catch (error) {
      console.log("Erro na criação de conta do usuário: ", error);
      alert("Falha ao criar a conta. Verifique se o e-mail já existe ou se o servidor está ativo.");
    }
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        <View style={styles.header}>
          <View style={styles.icon}>
            <Ionicons name="cube-outline" size={30} color="white" />
          </View>
          <Text style={styles.titulo}>Crie sua conta!</Text>
          <Text>Cadastre-se para começar</Text>
        </View>
        <View style={styles.mid}>
          <Text style={styles.txtSenha}>Nome</Text>
          <View style={styles.input}>
            <TextInput
              placeholder="Digite seu nome"
              onChangeText={setNome}
              value={nome}
            ></TextInput>
          </View>
          <Text style={styles.txt}>Email</Text>
          <View style={styles.input}>
            <TextInput
              placeholder="Digite seu Email"
              onChangeText={setEmail}
              value={email}
            ></TextInput>
          </View>
          <Text style={styles.txtSenha}>Senha</Text>
          <View style={styles.input}>
            <TextInput
              placeholder="Digite sua senha"
              secureTextEntry={true}
              onChangeText={setSenha}
              value={senha}
            ></TextInput>
          </View>
          <Text style={styles.txtSenha}>Confirmação de senha</Text>
          <View style={styles.input}>
            <TextInput
              placeholder="Confirme sua senha"
              secureTextEntry={true}
              onChangeText={setConfirmaSenha}
              value={confirmaSenha}
            ></TextInput>
          </View>
        </View>
        <View style={styles.botao}>
          <Botao
            titulo="Cadastrar"
            color="white"
            border={2}
            borderColor="black"
            backgroundColor={"black"}
            onPress={handleRegister}
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
    height: "80%",
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
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.md,
    paddingTop: 20,
  },
  txtSenha: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.md,
    paddingTop: 20,
  },
  esqueciSenhaBox: {
    width: "100%",
    alignItems: "flex-end",
    paddingRight: 5,
    paddingTop: 7,
  },
  botao: {
    width: "100%",
    paddingHorizontal: 10,
    paddingTop: 20,
  },
});

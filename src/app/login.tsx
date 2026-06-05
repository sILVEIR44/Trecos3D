import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useState, useEffect, useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { theme } from "@/theme";
import { Text } from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";
import { Botao } from "@/components/Buttom/button";
import { AuthContext } from "@/context/AuthContext";
import api from "../services/authService";

export default function Login() {
  const router = useRouter();
  const { signIn, token, user } = useContext(AuthContext) as any;

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  useEffect(() => {
    if (token && user) {
      if (user.role === 'admin' || user.role === 'superadmin') {
        router.replace("/admin");
      } else { 
        router.replace("/home");
      }
    }
  }, [token, user]);

  async function executarLogin() {
    try {
      const response = await api.post('/login', {
        email: email,
        password: senha
      });

      const { token: tokenRecebido, user: usuarioRecebido } = response.data;

      await signIn(usuarioRecebido, tokenRecebido);
      alert("Logado com sucesso.");

      if (usuarioRecebido.role === "admin" || usuarioRecebido.role === "superadmin") {
        router.replace("/admin");
      } else {
        router.replace("/home");
      }
    } catch (error) {
      alert("Acesso Negado: E-mail ou senha inválidos.");
      console.log(error);
    }
  }
  
  function handleNavigateRegister() {
    router.push("/register");
  }

  function handleNavigateRecuperar() {
    router.push("/recuperar");
  }

  function handleNavigateHome() {
    router.push("/home");
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        <View style={styles.header}>
          <View style={styles.icon}>
            <Ionicons name="cube-outline" size={30} color="white" />
          </View>
          <Text style={styles.titulo}>Bem-Vindo!</Text>
          <Text>Entre na sua conta</Text>
        </View>
        <View style={styles.mid}>
          <Text style={styles.txt}>Email</Text>
          <View style={styles.input}>
            <TextInput
              placeholder="Digite seu Email"
              onChangeText={setEmail}
              value={email}
              style={{ flex: 1, width: "100%", outlineStyle: "none", backgroundColor: "transparent" } as any}
            ></TextInput>
          </View>
          <Text style={styles.txtSenha}>Senha</Text>
          <View style={styles.input}>
            <TextInput
              placeholder="Digite sua senha"
              secureTextEntry={true}
              onChangeText={setSenha}
              value={senha}
              style={{ flex: 1, width: "100%", outlineStyle: "none", backgroundColor: "transparent" } as any}
            ></TextInput>
          </View>
          <View style={styles.esqueciSenhaBox}>
            <TouchableOpacity onPress={handleNavigateRecuperar}>
              <Text style={styles.esqueciSenha}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.botao}>
          <Botao
            titulo="Entrar"
            color="white"
            border={2}
            onPress={executarLogin}
            borderColor="black"
            backgroundColor={"black"}
          ></Botao>
          <View style={styles.cadastreBox}>
            <Text>Não tem um conta?</Text>
            <TouchableOpacity onPress={handleNavigateRegister}>
              <Text style={styles.cadastre}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
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
    alignItems: "center",
    gap: 20,
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderRadius: 10,
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
    height: 50,
    paddingHorizontal: 15,
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
    paddingTop: 40,
  },
  esqueciSenha: {
    fontFamily: theme.fonts.bold,
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
  cadastre: {
    fontFamily: theme.fonts.bold,
  },
  cadastreBox: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 10,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    paddingRight: 10,
  },
});
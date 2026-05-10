import { Text, View, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "@/theme";
import { Botao } from "@/components/Buttom/button";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.containerImg}>
        <Image
          style={styles.img}
          source={require("../assets/fundo.png")}
          resizeMode="cover"
        />
      </View>
      <View style={styles.bottom}>
        <Text style={styles.titulo}>Seja Bem Vindo!</Text>
        <Text style={styles.txt}>O que deseja fazer?</Text>
        <View style={styles.buttom}>
          <Botao titulo="Entrar" onPress={() => router.push("/login")} />
          <Botao titulo="Cadastrar" onPress={() => router.push("/register")} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerImg: {
    height: "70%",
  },
  img: {
    width: "100%",
    height: "100%",
  },
  bottom: {
    alignItems: "center",
    backgroundColor: theme.colors.grey1,
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
  },
  titulo: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "700",
    paddingTop: 10,
    color: theme.colors.white,
  },
  txt: {
    fontSize: theme.fontSize.md,
    color: theme.colors.white,
    paddingTop: 30,
    paddingBottom: 20,
  },
  buttom: {
    flexDirection: 'row',
    justifyContent:  'space-between',
    width: '100%',
    paddingHorizontal: 30
  }
});

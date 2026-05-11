import { View, StyleSheet } from "react-native";
import { Text } from "@/components/Text/index";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { theme } from "@/theme";
import { Botao } from "@/components/Buttom/button";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { fontSize } from "@/theme/fontSize";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <LinearGradient
          style={styles.cubo}
          colors={theme.colors.roxoRosa}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="cube-outline" size={70} color="white" />
        </LinearGradient>
        <MaskedView maskElement={<Text style={styles.titulo}>Loja 3D</Text>}>
          <LinearGradient
            colors={theme.colors.roxoRosa}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.titulo, { opacity: 0 }]}>Loja 3D</Text>
          </LinearGradient>
        </MaskedView>
        <Text style={styles.subTitulo}>
          Peças impressas em 3D prontras para retirada
        </Text>
      </View>
      <View style={styles.box}>
        <View style={styles.box1}>
          <View>
            <Feather name="shopping-bag" size={24} color="black" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.boxT}>Peças em estoque</Text>
            <Text style={styles.boxTxt}>
              Peças impressas em 3D prontas para retirada imediata. Alta
              qualidade e acabamento profissional.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: theme.colors.grey1,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
  },
  cubo: {
    width: 127,
    height: 127,
    borderRadius: 20,
    transform: [{ rotate: "6deg" }],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  titulo: {
    fontSize: theme.fontSize.titulo,
    color: theme.colors.white,
    fontFamily: theme.fonts.bold,
    marginBottom: 10,
  },
  subTitulo: {
    fontFamily: theme.fonts.regular,
    fontSize: theme.fontSize.md,
  },
  box: {
    paddingHorizontal: 20,
    marginTop: 15
  },
  box1: {
    backgroundColor: theme.colors.white,
    flexDirection: "row",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    borderColor: theme.colors.roxoClaro,
    borderWidth: 2,
    gap: 20,
    width: "100%",
  },
  boxT: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fonts.bold,
  },
  boxTxt: {
    textAlign: "justify",
  },
});

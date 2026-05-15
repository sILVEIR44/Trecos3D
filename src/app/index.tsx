import { View, StyleSheet } from "react-native";
import { Text } from "@/components/Text/index";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { theme } from "@/theme";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { InfoCard } from "@/components/InfoCard";
import { Botao } from "@/components/Buttom/button";

export default function Index() {
  const router = useRouter();

  function handleNavigateLogin() {
    router.push("/login");
  }

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
        <InfoCard
          titulo="Peças em estoque"
          texto="Peças impressas em 3D prontas para retirada imediata. Alta
              qualidade e acabamento profissional."
          borderColor={theme.colors.roxoClaro}
          icon={
            <Feather name="shopping-bag" size={24} color={theme.colors.roxo} />
          }
          iconBg={theme.colors.roxoClaro}
        />

        <InfoCard
          titulo="Peças sob encomenda"
          texto="Solicite orçamento para peças personalizadas. Imprimimos seu
              projeto com qualidade premium!"
          borderColor={theme.colors.rosaChoqueClaro}
          icon={
            <MaterialIcons
              name="auto-awesome"
              size={24}
              color={theme.colors.rosaChoque}
            />
          }
          iconBg={theme.colors.rosaChoqueClaro}
        />

        <InfoCard
          titulo="Retirada na Loja"
          texto="Peças prontas para retirada imediata. Compre online e retire na hora!"
          borderColor={theme.colors.azulClaro}
          icon={
            <Ionicons name="cube-outline" size={24} color={theme.colors.azul} />
          }
          iconBg={theme.colors.azulClaro}
        />
      </View>

      <View style={styles.botoes}>
        <LinearGradient style={styles.backBotao}
            colors={theme.colors.roxoRosa}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
          <Botao titulo="Entrar na Loja" onPress={handleNavigateLogin} color={theme.colors.white} icon={<Feather name="arrow-right" size={24} color="white" />}/>
        </LinearGradient>

        <Botao titulo="Explorar sem Login" onPress={handleNavigateLogin} color={"black"}  border={2} borderColor={theme.colors.cinzaClaro}/>
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
    marginTop: 15,
  },
  botoes: {
    marginTop: 20,
    gap: 20
  },
  backBotao: {
    borderRadius: 20
  }
});

import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { theme } from "@/theme";
import { Text } from "@/components/Text";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const router = useRouter();

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
          <Text>email</Text>
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
    
  }
});

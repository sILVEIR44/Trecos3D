import { Text, View, StyleSheet } from "react-native";
import { useRouter } from 'expo-router'
import { theme } from "@/theme";

export default function Login() {

  const router = useRouter()

  return (
    <View style={styles.container}>
      <Text>Login!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
});

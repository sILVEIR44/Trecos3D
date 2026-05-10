import { Text, View, StyleSheet } from "react-native";
import { useRouter } from 'expo-router'
import { theme } from "@/theme";

export default function Register() {

  const router = useRouter()

  return (
    <View style={styles.container}>
      <Text>Register!</Text>
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

import { useContext } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { AuthContext } from "../../context/AuthContext"

export default function PerfilAdmin() {
  const router = useRouter()
  const { user, signOut } = useContext(AuthContext)

  function realizarLogout() {
    router.replace("/login")
    setTimeout(() => signOut(), 300)
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={100} color="#9810FA" />
        <Text style={styles.nome}>{user?.name ?? "Admin"}</Text>
        <Text style={styles.email}>{user?.email ?? ""}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeTexto}>{user?.role ?? "admin"}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.botaoSair} onPress={realizarLogout}>
        <Ionicons name="log-out-outline" size={22} color="white" />
        <Text style={styles.botaoSairTexto}>Fazer Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center", padding: 20 },
  header: { alignItems: "center", marginBottom: 50 },
  nome: { fontSize: 24, fontWeight: "bold", color: "#222", marginTop: 12 },
  email: { fontSize: 14, color: "#888", marginTop: 4 },
  badge: { marginTop: 10, backgroundColor: "#E9D4FF", paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
  badgeTexto: { color: "#9810FA", fontWeight: "bold", fontSize: 13, textTransform: "capitalize" },
  botaoSair: { backgroundColor: "#9810FA", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, gap: 10, width: "80%", elevation: 3 },
  botaoSairTexto: { color: "white", fontWeight: "bold", fontSize: 16 },
})

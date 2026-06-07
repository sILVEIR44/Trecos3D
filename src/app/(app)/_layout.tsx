import { useContext, useEffect } from "react";
import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CartProvider } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";

export default function AppLayout() {
  const { user, isLoading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (user && (user.role === "admin")) {
      router.replace("/(admin)/dashboard" as any);
    }
  }, [user, isLoading]);

  if (isLoading) return null;
  if (!user) {
    router.replace("/login");
    return null;
  }
  if (user.role === "admin") return null;

  return (
    <CartProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "black",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopWidth: 1,
            borderTopColor: "#e0e0e0",
            height: 65,
            paddingBottom: 10,
            paddingTop: 5,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Loja",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="carrinho"
          options={{
            title: "Carrinho",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cart-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="perfil"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="orcamento"
          options={{
            title: "Orçamento",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bulb-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="meus-pedidos"
          options={{ href: null }}
        />
      </Tabs>
    </CartProvider>
  );
}

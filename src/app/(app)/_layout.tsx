import { useContext } from "react";
import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { CartProvider } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function AppLayout() {
  const { user, isLoading } = useContext(AuthContext);
  const { colors, isDark } = useTheme();

  if (isLoading) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <CartProvider>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.subtext,
          tabBarStyle: {
            backgroundColor: colors.tabBar,
            borderTopWidth: 1,
            borderTopColor: colors.tabBarBorder,
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
          name="meus-pedidos"
          options={{
            title: "Pedidos",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="receipt-outline" size={size} color={color} />
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
      </Tabs>
    </CartProvider>
  );
}

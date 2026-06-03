import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CartProvider } from "../../context/CartContext";

export default function AppLayout() {
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
          }
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
      </Tabs>
    </CartProvider>
  );
}
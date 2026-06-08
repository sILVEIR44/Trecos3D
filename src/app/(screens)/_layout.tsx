import { useContext } from "react";
import { Stack, Redirect } from "expo-router";
import { AuthContext } from "../../context/AuthContext";

export default function ScreensLayout() {
  const { user, isLoading } = useContext(AuthContext) as any;

  if (isLoading) return null;
  if (!user) return <Redirect href="/login" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}

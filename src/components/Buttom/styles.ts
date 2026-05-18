import { StyleSheet } from "react-native";
import { theme } from "@/theme";

export const styles = StyleSheet.create({
  botao: {
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 20,
    flexDirection: 'row',
    gap: 10,
    width: '100%'
  },
  txt: {
    fontSize: theme.fontSize.lg,
  },
});

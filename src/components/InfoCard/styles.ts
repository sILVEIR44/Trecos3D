import { StyleSheet } from "react-native";
import { theme } from "@/theme";

export const styles = StyleSheet.create({
 box: {
    backgroundColor: theme.colors.white,
    flexDirection: "row",
    padding: 20,
    borderRadius: 20,
    elevation: 5,
    borderWidth: 2,
    gap: 20,
    width: "100%",
    marginBottom: 10,
  },
   backIcon3: {
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  boxT: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fonts.bold,
  },
  boxTxt: {
    textAlign: "justify",
  },
});

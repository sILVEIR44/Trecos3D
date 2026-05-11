import { Text as RNText, TextProps, StyleSheet } from "react-native";

import { theme } from "@/theme";

export function Text(props: TextProps) {
  return (
    <RNText
      {...props}
      style={[styles.text, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: theme.fonts.regular,
  },
});
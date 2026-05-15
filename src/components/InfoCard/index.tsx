import { View } from "react-native";
import { Text } from "@/components/Text";
import { styles } from "./styles";

interface Props {
  titulo: string;
  texto: string;
  borderColor: string;
  iconBg: string;
  icon: React.ReactNode;
}

export function InfoCard({ titulo, texto, borderColor, iconBg, icon }: Props) {
  return (
    <View style={[styles.box, {borderColor: borderColor}]}>
      <View style={[styles.backIcon3, {backgroundColor: iconBg}]}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.boxT}>{titulo}</Text>
        <Text style={styles.boxTxt}>
          {texto}
        </Text>
      </View>
    </View>
  );
}

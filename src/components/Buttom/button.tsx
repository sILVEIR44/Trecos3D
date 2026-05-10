import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from "@/theme";


interface Props {
  titulo: string
  onPress: () => void
}

export function Botao({ titulo, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.botao} onPress={onPress}>
      <Text style={styles.texto}>{titulo}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  botao: {
    paddingVertical: 15,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30, 
    borderWidth: 2,
    borderColor: theme.colors.white,
     width: 150,

    
  },
  texto: {
    color: '#fff',
    fontWeight: 'bold',
  }
})
import { TouchableOpacity, TouchableOpacityProps} from 'react-native';
import { Text } from '@/components/Text/index';
import {styles} from "./styles"


type Props = TouchableOpacityProps & {
  titulo: string
  icon?: any
  color: string
  border?: number
  borderColor?: string
}

export function Botao({titulo, icon, color, border, borderColor, ...rest}: Props)  {

  return(
    <TouchableOpacity {...rest} style={[styles.botao, {borderWidth: border, borderColor: borderColor}]}>
      <Text style={[styles.txt, {color: color}]}>{titulo}</Text>
      {icon}
    </TouchableOpacity>
  )
}
import { TouchableOpacity, TouchableOpacityProps} from 'react-native';
import { Text } from '@/components/Text/index';
import {styles} from "./styles"


type Props = TouchableOpacityProps & {
  titulo: string
  icon?: any
  color: string
  border?: number
  borderColor?: string
  backgroundColor?: any
}

export function Botao({titulo, icon, color, border, borderColor,backgroundColor, ...rest}: Props)  {

  return(
    <TouchableOpacity {...rest} style={[styles.botao, {borderWidth: border, borderColor: borderColor, backgroundColor: backgroundColor}]}>
      <Text style={[styles.txt, {color: color}]}>{titulo}</Text>
      {icon}
    </TouchableOpacity>
  )
}
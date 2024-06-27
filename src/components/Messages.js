import { Text, View } from "react-native";
import { styles } from "../stylesheet/messages";

const Messages = ({enteredZones}) => {
  return (
    <View style={styles.messagesContainer}>
      {enteredZones.map(({message, _id}) => (
        <Text style={styles.message} key={String(_id)}>{message}</Text>
      )) }
    </View>
  )
}

export default Messages;
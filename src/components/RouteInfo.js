import { View, Text } from "react-native";
import { styles } from "../stylesheet/routeInfo"

const RouteInfo = ({routeInfo, routeInfo1}) => {
  return (
    <View style={styles.infoContainer}>
      {routeInfo && (
        <View style={styles.infoBox1}>
          <Text>Distance: {routeInfo.distance}</Text>
          <Text>ETA: {routeInfo.duration}</Text>
          <Text>Credit: {routeInfo.credits}</Text>
        </View>
      )}
      {routeInfo1 && (
        <View style={styles.infoBox2}>
          <Text>Distance: {routeInfo1.distance}</Text>
          <Text>ETA: {routeInfo1.duration}</Text>
          <Text>Credit: {routeInfo1.credits}</Text>
        </View>
      )}
    </View>
  )
}

export default RouteInfo;
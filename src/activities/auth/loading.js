import * as React from "react";
import {
  ActivityIndicator,
  View,
  StatusBar,
  AsyncStorage,
  Text,
  ToastAndroid,
  Button
} from "react-native";
import Data from "../../services/data";

class AuthLoading extends React.Component {
  state = {
    user: ""
  };
  componentDidMount() {
    this._bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    const data = await Data;
    const authorization = await AsyncStorage.getItem("authorization");
    let user = await AsyncStorage.getItem("user");
    user = JSON.parse(user);

    if (authorization) {
      this.setState({ user });

      data.refetch();

      this.props.navigation.navigate(
        user.userType == "driver" ? "DriverHome" : "ParentHome"
      );
    } else {
      this.props.navigation.navigate("DriverLogin");
    }
  };
  render() {
    return (
      <View
        style={[
          {
            flex: 1,
            justifyContent: "center"
          },
          {
            flexDirection: "row",
            justifyContent: "space-around",
            padding: 10
          }
        ]}
      >
        <ActivityIndicator />
        <StatusBar barStyle="default" />
        {__DEV__ ? (
          <View>
            <Text>{JSON.stringify(this.state.user, null, "\t")}</Text>
            <Button
              title="clear"
              style={{ margin: 30 }}
              onPress={() => {
                AsyncStorage.clear();
                this.props.navigation.navigate("DriverLogin");
              }}
            />
          </View>
        ) : null}
      </View>
    );
  }
}

export default AuthLoading;

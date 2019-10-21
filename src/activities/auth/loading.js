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

class AuthLoading extends React.Component {
  state = {
    user: ""
  };
  componentDidMount() {
    this._bootstrapAsync();
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    const authorization = await AsyncStorage.getItem("authorization");
    let user = await AsyncStorage.getItem("user");
    user = JSON.parse(user);

    if (authorization) {
      this.setState({ user });

      ToastAndroid.show(
        authorization ? `Authorised` : `UnAuthorised`,
        ToastAndroid.SHORT
      );

      // ToastAndroid.show(JSON.stringify(user), ToastAndroid.LONG);

      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      this.props.navigation.navigate(
        user.userType === "driver" ? "DriverHome" : "ParentHome"
      );
    } else {
      this.props.navigation.navigate("DriverLogin");
    }
  };
  render() {
    return (
      <View>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
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
    );
  }
}

export default AuthLoading;

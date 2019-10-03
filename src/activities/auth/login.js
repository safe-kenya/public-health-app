import * as React from "react";
import { Image, StyleSheet, View, Text } from "react-native";
import { Button, TextInput, Colors } from "react-native-paper";
import imageLogo from "../../images/logo-v4.png";

// import imageLogo from "../assets/images/logo.png";

class LoginScreen extends React.Component {
  state = {
    phone: "",
    password: ""
  };

  handleEmailChange = email => {
    this.setState({ email: email });
  };

  handlePasswordChange = password => {
    this.setState({ password: password });
  };

  handleLoginPress = () => {
    console.log("Login button pressed");
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.form}>
          <Image source={imageLogo} style={styles.logo} />
          <TextInput
            label="Phone Number"
            value={this.state.phone}
            onChangeText={phone => this.setState({ phone })}
          />
          <TextInput
            label="Password"
            value={this.state.password}
            secureTextEntry={true}
            onChangeText={password => this.setState({ password })}
          />
          <Text
            style={{ color: "blue" }}
            onPress={() => this.props.navigation.navigate("accountRecover")}
          >{`I dont remember my password`}</Text>
          <Text>{`\n`}</Text>
          <Button
            style={{ "padding-top": 20 }}
            mode="contained"
            onPress={() => this.props.navigation.navigate("ParentHome")}
          >
            Login
          </Button>
          <View style={{ alignItems: "center" }}>
            <Text>{`or`}</Text>
            <Text
              style={{ color: "blue" }}
              onPress={() => this.props.navigation.navigate("driverLogin")}
            >{`Login as a driver`}</Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ee9e3dff",
    alignItems: "center",
    justifyContent: "space-between"
  },
  logo: {
    // flex: 1,
    width: "100%",
    height: "30%",
    resizeMode: "contain",
    alignSelf: "flex-start"
  },
  form: {
    flex: 1,
    justifyContent: "center",
    width: "80%"
  }
});

export default LoginScreen;

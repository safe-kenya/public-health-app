import * as React from "react";
import {
  Image,
  StyleSheet,
  View,
  Text,
  AsyncStorage,
  PermissionsAndroid
} from "react-native";
import { Button, TextInput, Colors } from "react-native-paper";
import imageLogo from "../../images/logo-v4.png";
import axios from "axios";
import { ToastAndroid } from "react-native";
import { API } from "../../services/requests";
import SmsListener from "react-native-android-sms-listener";
import Spinner from "react-native-spinkit";
import DataService from "../../services/data";
let Data;
// import imageLogo from "../assets/images/logo.png";

// {
//   title: "Auto Verification OTP",
//   message: "need access to read sms, to verify OTP",
//   buttonNeutral: "Ask Me Later",
//   buttonNegative: "Cancel",
//   buttonPositive: "OK"
// }

async function requestPermission(perms) {
  perms.map(async ({ perm, reason }) => {
    try {
      const granted = await PermissionsAndroid.request(
        perm,
        reason
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can now", perm);
      } else {
        ToastAndroid.show("Perm denied " + perm, ToastAndroid.SHORT);
      }
    } catch (err) {
      console.warn("Perm err", { perm });
    }
  })

}

class LoginScreen extends React.Component {
  state = {
    user: '0711657108',
    userData: null,
    password: null,
    error: null,
    validating: false,
    loading: false
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

  async verifyCode(password) {
    try {
      ToastAndroid.show(`Verifying Code`, ToastAndroid.SHORT);
      const res = await axios.post(`${API}/auth/verify/sms`, {
        user: this.state.user,
        password
      });

      const {
        data: { token, data: userData }
      } = res;

      ToastAndroid.show(`Code Verification Successfull`, ToastAndroid.SHORT);

      await AsyncStorage.setItem("authorization", token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));

      this.setState({ userData })

      console.log(userData)

      if(userData.userType === 'parent')
        this.props.navigation.navigate("ParentHome");

      if(userData.userType === 'driver')
        this.props.navigation.navigate("DriverHome");

      if(userData.userType === 'student')
        this.props.navigation.navigate("StudentHome");

      Data.refetch();
      return;
    } catch (err) {
      console.warn("verifyCode", { err });
      // this.setState({ error: err.response.data });
    }
  }

  async componentDidMount() {
    Data = await DataService;
    const _this = this;

    await requestPermission([
      {
        perm: PermissionsAndroid.PERMISSIONS.READ_SMS,
        reason: {
          title: "Smart kids needs to read security password",
          message:
            "So we can display it on your map and share it with he interested parties.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        },
      },
      {
        perm: PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        reason: {
          title: "Smart kids needs to receive security password",
          message:
            "So we can display it on your map and share it with he interested parties.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      }
    ])
    // await PermissionsAndroid.requestMultiple([
    //   PermissionsAndroid.PERMISSIONS.READ_SMS,
    //   PermissionsAndroid.PERMISSIONS.RECEIVE_SMS
    // ]);

    const [readGranted, recieveGranted] = await Promise.all([
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: "Smart kids needs to know your location",
          message:
            "So we can display it on your map and share it with he interested parties.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      ),
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        {
          title: "Smart kids needs to know your location",
          message:
            "So we can display it on your map and share it with he interested parties.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      )
    ])

    if (readGranted && recieveGranted) {
      ToastAndroid.show(`Listening to messages`, ToastAndroid.SHORT);
      const subscription = SmsListener.addListener(async message => {
        ToastAndroid.show(message.body, ToastAndroid.SHORT);

        let verificationCodeRegex = /([\d]{5}) is your SmartKids login code. Don't reply to this message with your code./;

        if (verificationCodeRegex.test(message.body)) {
          let verificationCode = message.body.match(verificationCodeRegex)[1];

          ToastAndroid.show(`Code is ${verificationCode}`, ToastAndroid.SHORT);

          try {
            _this.setState({ password: verificationCode });
            this.setState({ validating: true });
            await _this.verifyCode(verificationCode);
            this.setState({ validating: false });
          } catch (err) {
            subscription.remove();
            return;
          }
        }
      });
    } else {
      console.log(`No Reading Sms Permisions ${JSON.stringify({ readGranted, recieveGranted })} `, ToastAndroid.SHORT);
    }
  }

  login = async () => {
    console.log('called')
    const _this = this;
    this.setState({ loading: true });
    try {
      // send a password if the used provided one, otherwise ask for a verification code
      const { user, password } = _this.state;
      const authData = Object.assign(
        {
          user
        },
        password
          ? {
            password
          }
          : {}
      );
      const res = await axios.post(`${API}/auth/login`, authData);

      _this.setState({ error: null, loading: false });

      const {
        data: { success, token, data: userData }
      } = res;

      console.log({ token });

      if (token) {
        ToastAndroid.show(`Code Verification Successfull`, ToastAndroid.SHORT);

        await AsyncStorage.setItem("authorization", token);
        await AsyncStorage.setItem("user", JSON.stringify(userData));

        this.props.navigation.navigate("Loading");

        Data.refetch();
        return;
      }

      if (success === true) {
        ToastAndroid.show(
          `Login code was sent, waiting to read it from sms`,
          ToastAndroid.SHORT
        );
      }

      // if (__DEV__ && !password && !token) {
      //   setTimeout(() => {
      //     const tmpPass = "0000";
      //     _this.setState({ error: null, loading: true });
      //     _this.verifyCode(tmpPass);
      //     _this.setState({ error: null, loading: false });
      //     _this.setState({ password: tmpPass });
      //   }, 3000);
      // }

      // check if otp sending was a success and if it was, show
    } catch (err) {
      if (err.response.data.message) {
        console.warn("login error", err.response.data);
        return _this.setState({
          error: err.response.data.message,
          loading: false
        });
      }

      _this.setState({ error: err.response.data, loading: false });
    }

    // this.props.navigation.navigate("ParentHome");
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.form}>
          {/* <Image source={imageLogo} style={styles.logo} /> */}
          <TextInput
            disabled={this.state.loading}
            label="Phone Number"
            keyboardType={"number-pad"}
            mode="outlined"
            style={{
              marginBottom: 10
            }}
            value={this.state.user}
            onChangeText={user => this.setState({ user })}
          />
          {
            !this.state.password && !this.state.userData
              ? null
              : <TextInput
                disabled={this.state.loading}
                label="Password"
                mode="outlined"
                style={{
                  marginBottom: 10
                }}
                value={this.state.password}
                secureTextEntry={true}
                onChangeText={password => this.setState({ password })}
              />
          }

          {!this.state.error ? null : (
            <Text style={{ marginBottom: 10, color: "red" }}>
              {this.state.error}
            </Text>
          )}

          <Button
            style={{ "padding-top": 10 }}
            loading={this.state.loading}
            disabled={
              (!this.state.password && !this.state.user) ||
              this.state.loading ||
              this.state.validating
            }
            mode="contained"
            onPress={() => this.login()}
          >
            {!this.state.userData ? "Login" : `Successfull, Welcome ${this.state.userData.name}!`}
          </Button>
          {/* <View style={{ alignItems: "center" }}>
            <Text>{`or`}</Text>
            <Text
              style={{ color: "blue" }}
              onPress={() => this.props.navigation.navigate("ParentLogin")}
            >{`Login as a parent`}</Text>
          </View> */}
        </View>

        {/* {!this.state.loading ? (
          <View>
            <Button
              style={{ "padding-top": 0 }}
              loading={this.state.loading}
              disabled={
                (!this.state.password && !this.state.user) ||
                this.state.loading ||
                this.state.validating
              }
              mode="contained"
              onPress={() => this.login()}
            >
              {this.state.password ? "Login" : "Send Login Code"}
            </Button>
            
          </View>
        ) : null} */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
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
  },
  spinner: {
    marginBottom: 50
  },
  btn: {
    marginTop: 20
  },
  text: {
    color: "white"
  }
});

export default LoginScreen;

import React from "react";
import {
  Text,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  AsyncStorage,
  Alert,
  ToastAndroid
} from "react-native";

import { Appbar } from "react-native-paper";
import { material } from "react-native-typography";

import PushNotificationIOS from "react-native";
import PubNubReact from "pubnub-react";
var PushNotification = require("react-native-push-notification");
import firebase from "react-native-firebase";

import { TabView, TabBar, SceneMap } from "react-native-tab-view";
import DataService from "../../services/data";
let Data;

import messages from "./messages";
import map from "./map";
import report from "./report";

const styles = StyleSheet.create({
  scene: {
    flex: 1
  }
});

const renderTabBar = props => (
  <TabBar
    {...props}
    style={{ backgroundColor: "white" }}
    activeColor={"black"}
    inactiveColor={"grey"}
  />
);

class Screen extends React.Component {
  state = {
    index: 0,
    parent: {
      students: []
    },
    routes: [
      { key: "messages", title: "Events" },
      { key: "map", title: "On Map" },
      { key: "report", title: "Report" }
    ]
  };

  async componentDidMount() {
    this.checkPermission();

    let Data = await DataService;
    const parent = Data.parent.get();

    this.setState({ parent });

    Data.parent.subscribe(parent => {
      this.setState(parent);
    });

    this.notificationListener();
    this.notificationOpenedListener();
  }

  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  //3
  async getToken() {
    let fcmToken = await AsyncStorage.getItem("fcmToken");
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        // user has a device token
        ToastAndroid.show("fcmToken", fcmToken);
        await AsyncStorage.setItem("fcmToken", fcmToken);
      }
    }
  }

  //2
  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      this.getToken();
    } catch (error) {
      // User has rejected permissions
      console.warn("permission rejected");
    }
  }

  showAlert(title, body) {
    Alert.alert(
      title,
      body,
      [{ text: "OK", onPress: () => console.log("OK Pressed") }],
      { cancelable: false }
    );
  }

  async createNotificationListeners() {
    /*
     * Triggered when a particular notification has been received in foreground
     * */
    this.notificationListener = firebase
      .notifications()
      .onNotification(notification => {
        const { title, body } = notification;
        this.showAlert(title, body);
      });

    /*
     * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
     * */
    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened(notificationOpen => {
        const { title, body } = notificationOpen.notification;
        this.showAlert(title, body);
      });

    /*
     * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
     * */
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      const { title, body } = notificationOpen.notification;
      this.showAlert(title, body);
    }
    /*
     * Triggered for data only payload in foreground
     * */
    this.messageListener = firebase.messaging().onMessage(message => {
      //process data message
      console.log(JSON.stringify(message));
    });
  }

  render() {
    return (
      <>
        <Appbar.Header>
          <Appbar.Content
            title={this.state.parent.name}
            subtitle={`Guardian, ${this.state.parent.gender}`}
          />
          <Appbar.Action
            icon="power-settings-new"
            onPress={() => {
              Alert.alert(
                "Log Out?",
                `Are you sure you remove all the data on the app?`,
                [
                  {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                  },
                  {
                    text: "OK",
                    onPress: async () => {
                      AsyncStorage.clear();
                      this.props.navigation.navigate("Loading");
                    }
                  }
                ],
                { cancelable: false }
              );
            }}
          />
        </Appbar.Header>

        <View
          style={{
            backgroundColor: "white",
            paddingLeft: 20
          }}
        >
          <Text style={material.subheading}>Showing tracking info for:</Text>
          <Text
            style={[
              material.headline,
              {
                paddingBottom: 10
              }
            ]}
          >
            {`${this.state.parent.students
              .map(student => student.names)
              .join(", ")}`}
          </Text>

          {/* <Text style={material.subheading}>Current Status:</Text>
          <Text
            style={[
              material.headline,
              {
                paddingBottom: 10
              }
            ]}
          >
            In school
          </Text> */}
        </View>

        {/* <Text>{"\n"}</Text> */}
        {/* <Text style={material.subheading}>Recent events</Text> */}

        <TabView
          navigationState={this.state}
          renderScene={SceneMap({
            messages,
            map,
            report
          })}
          renderTabBar={renderTabBar}
          swipeEnabled={true}
          lazy={true}
          onIndexChange={index => this.setState({ index })}
          initialLayout={{ width: Dimensions.get("window").width }}
          indicatorStyle={{ backgroundColor: "white" }}
        />
      </>
    );
  }
}

export default Screen;

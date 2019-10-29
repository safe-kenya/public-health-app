import React from "react";
import {
  Text,
  ScrollView,
  StyleSheet,
  View,
  AsyncStorage,
  Dimensions,
  Alert
} from "react-native";

import { Appbar, ProgressBar, Colors } from "react-native-paper";

import { TabView, TabBar, SceneMap } from "react-native-tab-view";

import dropOfList from "./dropOfList";
import map from "./map";
import DataService from "../../services/data";

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
    routes: [
      { key: "dropOfList", title: "Your Trips" },
      { key: "map", title: "Your Location" }
    ],
    selectedTrip: null,
    schedules: [],
    driver: { username: "" }
  };

  async componentDidMount() {
    let Data = await DataService;
    const driver = Data.driver.get();
    this.setState({ driver });

    Data.driver.subscribe(driver => {
      this.setState(driver);
    });
  }

  render() {
    return (
      <>
        <Appbar.Header>
          <Appbar.Content title={"Welcome, " + this.state.driver.username} />
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
        <TabView
          navigationState={this.state}
          renderScene={SceneMap({
            dropOfList,
            map
          })}
          renderTabBar={renderTabBar}
          swipeEnabled={true}
          lazy={false}
          onIndexChange={index => this.setState({ index })}
          initialLayout={{ width: Dimensions.get("window").width }}
          indicatorStyle={{ backgroundColor: "white" }}
          style={{ backgroundColor: "pink" }}
          activeColor="red"
        />
      </>
    );
  }
}

export default Screen;

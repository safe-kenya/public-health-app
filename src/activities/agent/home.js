import React from "react";
import { Text, ScrollView, StyleSheet, View, Dimensions } from "react-native";

import { Appbar, ProgressBar, Colors } from "react-native-paper";

import { TabView, TabBar, SceneMap } from "react-native-tab-view";

import dropOfList from "./dropOfList";
import map from "./map";
import Data from "../../services/data";

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
    drivers: [{ username: '' }]
  };

  componentDidMount() {
    const drivers = Data.drivers.list();
    this.setState({ drivers });

    Data.drivers.subscribe(drivers => {
      this.setState(drivers);
    });
  }

  render() {
    return (
      <>
        <Appbar.Header>
          <Appbar.Content title={"Welcome, " + this.state.drivers[0].username} />
        </Appbar.Header>

        <TabView
          navigationState={this.state}
          renderScene={SceneMap({
            dropOfList,
            map
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

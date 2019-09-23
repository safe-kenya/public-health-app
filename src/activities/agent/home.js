import React from "react";
import { Text, ScrollView, StyleSheet, View, Dimensions } from "react-native";

import { Appbar, ProgressBar, Colors } from "react-native-paper";

import { TabView, TabBar, SceneMap } from "react-native-tab-view";

import dropOfList from "./dropOfList";
import map from "./map";

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
      { key: "dropOfList", title: "Drop Off List" },
      { key: "map", title: "Your Location" }
    ],
    selectedTrip: null,
    schedules: []
  };

  render() {
    return (
      <>
        <Appbar.Header>
          <Appbar.Content title="Welcome, Kamau" subtitle="Bus Driver" />
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

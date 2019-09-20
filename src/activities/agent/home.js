import React from "react";
import { Dropdown } from "react-native-material-dropdown";
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
      { key: "dropOfList", title: "Drop Off List" },
      { key: "map", title: "Your Location" }
    ],
    selectedTrip: null,
    schedules: []
  };

  tripSelected(trip) {
    let selectedTrip = this.state.schedules.filter(
      schedule => schedule.id === trip
    )[0];
    this.setState({
      selectedTrip
    });
  }

  componentDidMount() {
    const schedules = Data.schedules.list();
    this.setState({ schedules });

    Data.schedules.subscribe(schedule => {
      this.setState(schedule);
    });
  }

  render() {
    return (
      <>
        <Appbar.Header>
          <Appbar.Content title="Welcome, Kamau" subtitle="Bus Driver" />
        </Appbar.Header>

        <View
          style={{
            paddingRight: 20,
            paddingLeft: 20,
            paddingBottom: 5
          }}
        >
          <Dropdown
            label="Select Trip"
            data={this.state.schedules.map(schedule => {
              return {
                label: schedule.name,
                value: schedule.id
              };
            })}
            onChangeText={trip => this.tripSelected(trip)}
          />
        </View>
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

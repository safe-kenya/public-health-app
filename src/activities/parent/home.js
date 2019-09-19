import React from "react";
import { Text, ScrollView, StyleSheet, View, Dimensions } from "react-native";

import { Appbar } from "react-native-paper";
import { material } from "react-native-typography";

import { TabView, TabBar, SceneMap } from "react-native-tab-view";

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
    routes: [
      { key: "messages", title: "Events" },
      { key: "map", title: "On Map" },
      { key: "report", title: "Report" }
    ]
  };

  render() {
    return (
      <>
        <Appbar.Header>
          <Appbar.Content title="Welcome, Gathoni" subtitle="Parent, mother" />
        </Appbar.Header>

        <View
          style={{
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
            John N. kumani, Mathew .W Njeri
          </Text>

          <Text style={material.subheading}>Current Status:</Text>
          <Text
            style={[
              material.headline,
              {
                paddingBottom: 10
              }
            ]}
          >
            In school
          </Text>
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
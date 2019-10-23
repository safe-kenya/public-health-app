import React from "react";
import {
  Text,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  AsyncStorage,
  Alert
} from "react-native";

import { Appbar } from "react-native-paper";
import { material } from "react-native-typography";

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
    let Data = await DataService;
    const parent = Data.parent.get();

    this.setState({ parent });

    Data.parent.subscribe(parent => {
      this.setState(parent);
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

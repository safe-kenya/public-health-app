import React from "react";

import { List, Checkbox, Searchbar } from "react-native-paper";
import {
  Text,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity
} from "react-native";
import { Appbar, ProgressBar, Colors } from "react-native-paper";
import { Dropdown } from "react-native-material-dropdown";
import Icon from "react-native-vector-icons/MaterialIcons";
import call from "react-native-phone-call";

import Data from "../../services/data";

class Screen extends React.Component {
  state = {
    schedules: [],
    students: [],
    dropOffMap: {}
  };

  tripSelected(trip) {
    let selectedTrip = this.state.schedules.filter(
      schedule => schedule.id === trip
    )[0];

    // if route is missing, for whatever reason
    if (selectedTrip.route)
      this.setState({
        students: selectedTrip.route.students
      });
  }

  callParent(parent) {
    // call parent here
    call({
      number: parent.phone,
      prompt: false
    }).catch(console.error);
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
      <ScrollView>
        <View
          style={{
            // position: "absolute",
            // width: "97%",
            height: 60,
            backgroundColor: "white",
            color: "black"
            // padding: 20
            // margin: 10,
            // bottom: 0
          }}
        >
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
          {/* <Searchbar
            placeholder="Enter student name to search..."
            onChangeText={query => {
              this.setState({ firstQuery: query });
            }}
            value={""}
          /> */}
        </View>
        {/* <ProgressBar progress={0.5} color={Colors.blue} /> */}
        <List.Section>
          {/* <List.Subheader>Select student after drop off</List.Subheader> */}
          {this.state.students.map(student => {
            return (
              <List.Item
                key={student.id}
                title={student.names}
                left={props => (
                  <View
                    style={
                      {
                        // marginTop: 10
                      }
                    }
                  >
                    <Checkbox
                      status={this.state.dropOffMap[student.id]}
                      onPress={() => {
                        this.setState({
                          dropOffMap: {
                            ...this.state.dropOffMap,
                            [student.id]:
                              this.state.dropOffMap[student.id] === "checked"
                                ? "unchecked"
                                : "checked"
                          }
                        });
                      }}
                    />
                  </View>
                )}
                right={props => (
                  <TouchableOpacity
                    onPress={() => this.callParent(student.parent)}
                  >
                    <Icon name="phone-forwarded" size={27} color="#00000" />
                  </TouchableOpacity>
                )}
              />
            );
          })}
        </List.Section>
      </ScrollView>
    );
  }
}

export default Screen;

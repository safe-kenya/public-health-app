import React from "react";

import { List, Checkbox, Searchbar } from "react-native-paper";
import {
  Text,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  ToastAndroid,
  Alert
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

    if (!this.state[selectedTrip.id]) {
      this.setState(
        {
          [selectedTrip.id]: {}
        },
        () => {
          // if route is missing, for whatever reason
          if (selectedTrip.route)
            this.setState({
              selectedTrip,
              students: selectedTrip.route.students
            });
        }
      );
    } else {
      if (selectedTrip.route)
        this.setState({
          selectedTrip,
          students: selectedTrip.route.students
        });
    }
  }

  callParent(parent) {
    // call parent here
    if (parent.phone)
      return call({
        number: parent.phone,
        prompt: false
      }).catch(console.error);

    ToastAndroid.show("Parents phone is not available", ToastAndroid.SHORT);
  }

  async selectStudent(student) {
    this.setState({
      [this.state.selectedTrip.id]: {
        ...this.state.dropOffMap,
        [student.id]:
          this.state.dropOffMap[student.id] === "checked"
            ? "unchecked"
            : "checked"
      }
    });

    Data.events.create({
      student: student.id,
      time: new Date().toLocaleTimeString(),
      type: "CHECKEDON",
      trip: this.state.selectedTrip.id
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
                      status={
                        this.state[this.state.selectedTrip.id][student.id]
                      }
                      onPress={() => {
                        if (
                          this.state[this.state.selectedTrip.id] &&
                          this.state[this.state.selectedTrip.id][student.id] !==
                            "checked"
                        ) {
                          Alert.alert(
                            "Confirmation",
                            `Are you sure you want to tick ${student.names.toUpperCase()} off this list?`,
                            [
                              {
                                text: "Cancel",
                                onPress: () => console.log("Cancel Pressed"),
                                style: "cancel"
                              },
                              {
                                text: "OK",
                                onPress: async () => this.selectStudent(student)
                              }
                            ],
                            { cancelable: false }
                          );
                        }
                      }}
                    />
                  </View>
                )}
                right={props => (
                  <TouchableOpacity
                    onPress={() =>
                      this.callParent(student.parent || student.parent2)
                    }
                  >
                    <Icon name="phone-forwarded" size={25} color="black" />
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

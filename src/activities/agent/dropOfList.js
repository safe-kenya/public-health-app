import React from "react";

import { List, Checkbox, Searchbar } from "react-native-paper";
import { Text, ScrollView, StyleSheet, View, Dimensions } from "react-native";
import { Appbar, ProgressBar, Colors } from "react-native-paper";
import { Dropdown } from "react-native-material-dropdown";

import Data from "../../services/data";

class Screen extends React.Component {
  state = {
    schedules: [],
    students: [
      {
        name: "Sheila R. Carrillo"
      },
      {
        name: "Robert M. Jacobs"
      }
    ],
    dropOffMap: {}
  };

  tripSelected(trip) {
    let selectedTrip = this.state.schedules.filter(
      schedule => schedule.id === trip
    )[0];
    this.setState({
      students: selectedTrip.route.students
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
                key={student.name}
                title={student.name}
                left={props => (
                  <View
                    style={
                      {
                        // marginTop: 10
                      }
                    }
                  >
                    <Checkbox
                      status={this.state.dropOffMap[student.name]}
                      onPress={() => {
                        this.setState({
                          dropOffMap: {
                            ...this.state.dropOffMap,
                            [student.name]:
                              this.state.dropOffMap[student.name] === "checked"
                                ? "unchecked"
                                : "checked"
                          }
                        });
                      }}
                    />
                  </View>
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

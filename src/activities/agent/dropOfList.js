import React from "react";

import { List, Checkbox, Searchbar } from "react-native-paper";
import { Text, ScrollView, StyleSheet, View, Dimensions } from "react-native";
import { Appbar, ProgressBar, Colors } from "react-native-paper";

class Screen extends React.Component {
  state = {
    students: [
      {
        name: "Sheila R. Carrillo"
      },
      {
        name: "Robert M. Jacobs"
      },
      {
        name: "Claire J. Brown"
      },
      {
        name: "Walter C. Stork"
      },
      {
        name: "Joseph C. Deleon"
      },
      {
        name: "Lena E. Edward"
      }
    ],
    dropOffMap: {}
  };

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
          <Searchbar
            placeholder="Enter student name to search..."
            onChangeText={query => {
              this.setState({ firstQuery: query });
            }}
            value={""}
          />
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

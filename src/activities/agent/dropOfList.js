import React from "react";

import { List, Checkbox, Searchbar } from "react-native-paper";
import {
  Text,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
  ToastAndroid,
  Alert
} from "react-native";
import {
  Appbar,
  ProgressBar,
  Colors,
  Button,
  Snackbar
} from "react-native-paper";
import { Dropdown } from "react-native-material-dropdown";
import Icon from "react-native-vector-icons/MaterialIcons";
import call from "react-native-phone-call";

import DataService from "../../services/data";
let Data;

class Screen extends React.Component {
  state = {
    schedules: [],
    students: [],
    cancelledTrips: [],
    completedTrips: [],
    inCompletedStudentsList: [],
    dropOffMap: {},
    tripId: null,
    tripStarted: false,
    refreshing: false,
    tripSelected: null
  };

  tripSelected(trip) {
    let selectedSchedule = this.state.schedules.filter(
      schedule => schedule.id === trip
    )[0];

    if (!this.state[selectedSchedule.id]) {
      this.setState(
        {
          [selectedSchedule.id]: {}
        },
        () => {
          // if route is missing, for whatever reason
          if (selectedSchedule.route)
            this.setState({
              selectedSchedule,
              students: selectedSchedule.route.students
            });
        }
      );
    } else {
      if (selectedSchedule.route)
        this.setState({
          selectedSchedule,
          students: selectedSchedule.route.students
        });
    }
  }

  startTtrip = () => {
    if (this.state.cancelledTrips.includes(this.state.selectedSchedule.id)) {
      return Alert.alert(
        "Start Cancelled trip?",
        `This trip was marked cancelled for today, if you continue. you will be expected to complete it. `,
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
          },
          {
            text: "OK",
            onPress: async () => {
              const tripId = await Data.trips.start(
                this.state.selectedSchedule.id
              );
              this.setState({ tripStarted: true, tripId });
            }
          }
        ],
        { cancelable: false }
      );
    }

    Alert.alert(
      "Start New Trip?",
      `Dont forget to check off every student on the list as you drop them off`,
      [
        {
          text: "No",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "Ok, Continue",
          onPress: async () => {
            const tripId = await Data.trips.start(
              this.state.selectedSchedule.id
            );
            this.setState({ tripStarted: true, tripId });
          }
        }
      ],
      { cancelable: false }
    );
  };

  callParent(parent) {
    // call parent here
    if (parent && parent.phone)
      return call({
        number: parent.phone,
        prompt: false
      }).catch(console.error);

    ToastAndroid.show("Parents phone is not available", ToastAndroid.SHORT);
  }

  async overideStudent(student) {
    this.setState({
      [this.state.selectedSchedule.id]: {
        ...this.state[this.state.selectedSchedule.id],
        [student.id]: "indeterminate"
      }
    });

    Data.events.create({
      student: student.id,
      time: new Date().toLocaleTimeString(),
      type: "CHECKEDON",
      trip: this.state.selectedSchedule.id
    });
  }

  async selectStudent(student) {
    this.setState({
      [this.state.selectedSchedule.id]: {
        ...this.state[this.state.selectedSchedule.id],
        [student.id]:
          this.state[this.state.selectedSchedule.id][student.id] === "checked"
            ? "unchecked"
            : "checked"
      }
    });

    Data.events.create({
      student: student.id,
      time: new Date().toLocaleTimeString(),
      type: "CHECKEDON",
      trip: this.state.tripId
    });
  }

  async cancelPickup(student) {
    this.setState({
      [this.state.selectedSchedule.id]: {
        ...this.state[this.state.selectedSchedule.id],
        [student.id]: "indeterminate"
      }
    });

    Data.events.create({
      student: student.id,
      time: new Date().toLocaleTimeString(),
      type: "CHECKEDOFF",
      trip: this.state.tripId
    });
  }

  async completeTrip() {
    this.setState({
      completedTrips: [
        ...this.state.completedTrips,
        this.state.selectedSchedule.id
      ]
    });

    const completedList = this.state.students.map(student => {
      const checked = this.state[this.state.selectedSchedule.id][student.id];

      return checked === "checked" ? true : false;
    });

    if (completedList.includes(false))
      return Alert.alert(
        "Confirmation",
        `Some students have not marked as completed, a trip cannot be completed if this students have not been checked off`,
        [
          {
            text: "Overide students as off",
            onPress: () => {
              // overide here
              const inCompletedStudentsList = this.state.students.filter(
                student => {
                  const checked = this.state[this.state.selectedSchedule.id][
                    student.id
                  ];

                  return checked !== "checked" ? true : false;
                }
              );

              inCompletedStudentsList.map(student =>
                this.overideStudent(student)
              );

              Data.trips.finish(this.state.selectedSchedule.id);

              this.setState({ inCompletedStudentsList, tripStarted: false });
            },
            style: "cancel"
          },
          {
            text: "OK",
            onPress: async () => {}
          }
        ],
        { cancelable: false }
      );

    Data.trips.finish(this.state.selectedSchedule.id);
    this.setState({ tripStarted: false });
  }

  async cancelTrip() {
    Data.trips.cancel(this.state.selectedSchedule.id);

    this.setState({
      cancelledTrips: [
        ...this.state.cancelledTrips,
        this.state.selectedSchedule.id
      ]
    });
  }

  checkoffStudent(student) {
    if (
      this.state[this.state.selectedSchedule.id] &&
      this.state[this.state.selectedSchedule.id][student.id] !== "checked"
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
  }

  async onRefresh() {
    await Data.refetch();
    this.setState({ refreshing: false });
  }

  async componentDidMount() {
    Data = await DataService;
    const schedules = Data.schedules.list();
    this.setState({ schedules });

    Data.schedules.subscribe(schedule => {
      this.setState(schedule);
    });
  }

  render() {
    return (
      <>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => this.onRefresh()}
            />
          }
        >
          <View
            style={{
              height: this.state.tripStarted === true ? 60 : 120,
              backgroundColor: "white",
              color: "black"
            }}
          >
            <View
              style={{
                paddingRight: 20,
                paddingLeft: 20,
                paddingBottom: 5
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 1 }}>
                  <Dropdown
                    disabled={this.state.tripStarted}
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

                {!this.state.selectedSchedule ? null : this.state
                    .tripStarted ? (
                  <View style={{ width: 96, marginLeft: 8, marginTop: 25 }}>
                    <Button
                      mode="contained"
                      onPress={() => this.completeTrip()}
                    >
                      FINISH
                    </Button>
                  </View>
                ) : null}
              </View>
              <View style={{ flexDirection: "row" }}>
                {!this.state.selectedSchedule ? null : (
                  <View
                    style={{
                      width: this.state.completedTrips.includes(
                        this.state.selectedSchedule.id
                      )
                        ? 250
                        : 96,
                      marginLeft: 0,
                      marginTop: 10
                    }}
                  >
                    {this.state.tripStarted ? null : (
                      <Button
                        mode="contained"
                        color="green"
                        disabled={this.state.completedTrips.includes(
                          this.state.selectedSchedule.id
                        )}
                        onPress={() => this.startTtrip()}
                      >
                        {!this.state.completedTrips.includes(
                          this.state.selectedSchedule.id
                        )
                          ? "START"
                          : "COMPLETED FOR TODAY"}
                      </Button>
                    )}
                  </View>
                )}

                {!this.state.selectedSchedule ||
                this.state.completedTrips.includes(
                  this.state.selectedSchedule.id
                ) ? null : this.state.tripStarted ? null : (
                  <View
                    style={{
                      width: this.state.cancelledTrips.includes(
                        this.state.selectedSchedule.id
                      )
                        ? 120
                        : 200,
                      marginLeft: 4,
                      marginTop: 10
                    }}
                  >
                    <Button
                      mode="contained"
                      disabled={this.state.cancelledTrips.includes(
                        this.state.selectedSchedule.id
                      )}
                      color="red"
                      onPress={() => {
                        Alert.alert(
                          "Confirmation",
                          `Are you sure you cancel the trip for today?`,
                          [
                            {
                              text: "Cancel",
                              onPress: () => console.log("Cancel Pressed"),
                              style: "cancel"
                            },
                            {
                              text: "OK",
                              onPress: async () => this.cancelTrip()
                            }
                          ],
                          { cancelable: false }
                        );
                      }}
                    >
                      {this.state.cancelledTrips.includes(
                        this.state.selectedSchedule.id
                      )
                        ? "CANCELLED"
                        : "CANCEL FOR TODAY"}
                    </Button>
                  </View>
                )}
              </View>
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
                    <View>
                      <Checkbox
                        disabled={!this.state.tripStarted && !this.state.tripId}
                        status={
                          this.state[this.state.selectedSchedule.id][student.id]
                        }
                        onPress={() => this.checkoffStudent(student)}
                      />
                    </View>
                  )}
                  right={props =>
                    this.state.tripStarted ? (
                      <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity
                          onPress={() => this.cancelPickup(student)}
                        >
                          <Icon
                            style={{
                              paddingRight: 7,
                              paddingTop: 7
                            }}
                            name="cancel"
                            size={20}
                            color="black"
                          />
                        </TouchableOpacity>
                        {!student.parent ? null : (
                          <TouchableOpacity
                            onPress={() =>
                              this.callParent(student.parent || student.parent2)
                            }
                          >
                            <Icon
                              style={{
                                paddingRight: 7,
                                paddingTop: 7
                              }}
                              name="phone-forwarded"
                              size={20}
                              color="black"
                            />
                          </TouchableOpacity>
                        )}

                        {!this.state.selectedSchedule ? null : this.state
                            .tripStarted ? null : (
                          <View
                            style={{ width: 96, marginLeft: 4, marginTop: 10 }}
                          >
                            <Button
                              mode="contained"
                              color="red"
                              onPress={() =>
                                Alert.alert(
                                  `Cancel this trip for ${student.names.toUpperCase()}?`,
                                  `This is to indicate that this student was not able to take this trip either for lateness etc`,
                                  [
                                    {
                                      text: "NO",
                                      onPress: () =>
                                        console.log("Cancel Pressed"),
                                      style: "cancel"
                                    },
                                    {
                                      text: "Yes, I want to cancel",
                                      onPress: async () =>
                                        this.cancelStudentPickup()
                                    }
                                  ],
                                  { cancelable: false }
                                )
                              }
                            >
                              Cancel
                            </Button>
                          </View>
                        )}
                      </View>
                    ) : null
                  }
                />
              );
            })}
          </List.Section>
        </ScrollView>
        <Snackbar
          visible={this.state.visible}
          onDismiss={() => this.setState({ visible: false })}
          action={{
            label: "Dismiss",
            onPress: () => this.setState({ visible: false })
          }}
        >
          You need to start the trip to start checking off students.
        </Snackbar>
      </>
    );
  }
}

export default Screen;

import React from "react";
import DataService from "../../services/data";
let Data;

import { List, Checkbox } from "react-native-paper";
import {
  Text,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  RefreshControl
} from "react-native";

class Screen extends React.Component {
  state = {
    refreshing: false,
    parent: {
      students: []
    }
  };

  async componentDidMount() {
    let Data = await DataService;
    const parent = Data.parent.get();

    if (parent) {
      this.setState({ parent });

      Data.parent.subscribe(parent => {
        this.setState(parent);
      });
    }
  }
  async onRefresh() {
    let Data = await DataService;
    console.log(Data);
    const data = await Data.refetch();
    console.log(data);
    this.setState({ refreshing: false });
  }

  render() {
    return (
      <ScrollView
        style={{
          backgroundColor: "white"
        }}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={() => this.onRefresh()}
          />
        }
      >
        <List.Section>
          {/* <List.Subheader>Events Today</List.Subheader> */}
          {this.state.parent.students.map(student =>
            student.events.map(event => (
              <List.Item
                title={`${event.trip.schedule.name}`}
                description={`Logged  at ${event.time}`}
                left={props => <List.Icon {...props} icon="location-on" />}
              />
            ))
          )}
          {/* <List.Item
            title="Arrival at school, late"
            description="Logged  at 8:32 am"
            left={props => <List.Icon {...props} icon="location-on" />}
          />
          <List.Item
            title="Bus dropoff trip start, on time"
            description="Logged  at 4:00 pm"
            left={props => <List.Icon {...props} icon="location-on" />}
          />
          <List.Item
            title="Bus dropoff Home, late"
            description="Logged  at 5:43 am"
            left={props => <List.Icon {...props} icon="location-on" />}
          /> */}
        </List.Section>

        {/* <List.Section>
          <List.Subheader>Yesterday</List.Subheader>
          <List.Item
            title="Bus pickup from home, on time"
            description="Logged  at 7:32 am"
            left={props => <List.Icon {...props} icon="location-on" />}
          />
          <List.Item
            title="Arrival at school, late"
            description="Logged  at 8:32 am"
            left={props => <List.Icon {...props} icon="location-on" />}
          />
          <List.Item
            title="Bus dropoff trip start, on time"
            description="Logged  at 4:00 pm"
            left={props => <List.Icon {...props} icon="location-on" />}
          />
          <List.Item
            title="Bus dropoff Home, late"
            description="Logged  at 5:43 am"
            left={props => <List.Icon {...props} icon="location-on" />}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>2 days ago</List.Subheader>
          <List.Item
            title="Bus pickup from home, on time"
            description="Logged  at 7:32 am"
            left={props => <List.Icon {...props} icon="location-on" />}
          />
          <List.Item
            title="Arrival at school, late"
            description="Logged  at 8:32 am"
            left={props => <List.Icon {...props} icon="location-on" />}
          />
          <List.Item
            title="Bus dropoff trip start, on time"
            description="Logged  at 4:00 pm"
            left={props => <List.Icon {...props} icon="location-on" />}
          />
          <List.Item
            title="Bus dropoff Home, late"
            description="Logged  at 5:43 am"
            left={props => <List.Icon {...props} icon="location-on" />}
          />
        </List.Section> */}
      </ScrollView>
    );
  }
}

export default Screen;

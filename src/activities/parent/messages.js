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

  async onRefresh() {
    await Data.refetch();
    this.setState({ refreshing: false });
  }
  async componentDidMount() {
    let Data = await DataService;
    const parent = Data.parent.get();

    console.log({ parent });
    if (parent) {
      this.setState({ parent });

      Data.parent.subscribe(parent => {
        this.setState(parent);
      });
    }
  }
  render() {
    return (
      <ScrollView
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
            title="Buss dropoff trip start, on time"
            description="Logged  at 4:00 pm"
            left={props => <List.Icon {...props} icon="location-on" />}
          />
          <List.Item
            title="Buss dropoff Home, late"
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
            title="Buss dropoff trip start, on time"
            description="Logged  at 4:00 pm"
            left={props => <List.Icon {...props} icon="location-on" />}
          />
          <List.Item
            title="Buss dropoff Home, late"
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
            title="Buss dropoff trip start, on time"
            description="Logged  at 4:00 pm"
            left={props => <List.Icon {...props} icon="location-on" />}
          />
          <List.Item
            title="Buss dropoff Home, late"
            description="Logged  at 5:43 am"
            left={props => <List.Icon {...props} icon="location-on" />}
          />
        </List.Section> */}
      </ScrollView>
    );
  }
}

export default Screen;

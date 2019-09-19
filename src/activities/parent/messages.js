import React from "react";

import { List, Checkbox } from "react-native-paper";
import { Text, ScrollView, StyleSheet, View, Dimensions } from "react-native";

class Screen extends React.Component {
  render() {
    return (
      <ScrollView>
        <List.Section>
          <List.Subheader>Events Today</List.Subheader>
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
        </List.Section>
      </ScrollView>
    );
  }
}

export default Screen;

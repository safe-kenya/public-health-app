import React from "react";
import {
  Text,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  PermissionsAndroid
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps"; // remove PROVIDER_GOOGLE import if not using Google Maps
import Geolocation from "react-native-geolocation-service";
import { material } from "react-native-typography";
import DataService from "../../services/data";

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
});

let mapRef;

class Screen extends React.Component {
  state = {
    parent: {
      students: []
    },
    markers: []
  };

  async componentDidMount() {
    let Data = await DataService;
    const parent = Data.parent.get();

    const tempMmarkers = [];
    parent.students.map(student =>
      student.events.map(event =>
        event.trip.locReports.map(report => {
          tempMmarkers.push({
            time: report.time,
            longitude: report.loc.lng,
            latitude: report.loc.lat
          });
        })
      )
    );

    this.setState({ parent, markers: tempMmarkers }, () => {
      if (this.state.markers[0]) {
        const { latitude, longitude } = this.state.markers[0];
        setTimeout(() => {
          mapRef.animateToRegion(
            {
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01
            },
            2000
          );
        }, 1000);
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          ref={ref => (mapRef = ref)}
          loadingEnabled={true}
          zoomEnabled={true}
        >
          {this.state.markers.map(({ longitude, latitude }) => {
            return (
              <Marker
                key={latitude + " - " + longitude}
                identifier={latitude + " - " + longitude}
                coordinate={{
                  latitude,
                  longitude
                }}
              />
            );
          })}
        </MapView>
        {!this.state.markers[0] ? null : (
          <View
            style={{
              position: "absolute",
              width: "97%",
              height: 60,
              backgroundColor: "white",
              color: "black",
              padding: 20,
              // margin: 10,
              bottom: 0
            }}
          >
            <Text style={material.subheading}>
              Last recieved location as of: {`${this.state.markers[0].time}`}
            </Text>
          </View>
        )}
      </View>
    );
  }
}

export default Screen;

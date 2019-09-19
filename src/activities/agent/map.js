import React from "react";
import {
  Text,
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  PermissionsAndroid
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import Geolocation from "react-native-geolocation-service";
import { material } from "react-native-typography";

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
    markers: []
  };

  async componentDidMount() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Smart kids needs to know your location",
          message:
            "So we can display it on your map and share it with he interested parties.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );

      if (granted) {
        console.log("fetching location");
        Geolocation.getCurrentPosition(
          ({ coords: { longitude, latitude } }) => {
            console.log({ longitude, latitude });
            this.setState(
              {
                markers: [...this.state.markers, { longitude, latitude }]
              },
              () => {
                const { latitude, longitude } = this.state.markers[0];

                mapRef.animateToRegion(
                  {
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                  },
                  2000
                );
              }
            );

            // now watch
            // Geolocation.watchPosition(
            //   position => {
            //     console.log(position);
            //     this.setState({ markers: [...this.state.markers, position] });

            //     this.mapRef.fitToSuppliedMarkers(
            //       someArrayOfMarkers,
            //       false // not animated
            //     );
            //   },
            //   error => {
            //     console.log(error.code, error.message);
            //   },
            //   { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            // );
          },
          error => {
            console.log(error.code, error.message);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      }
    } catch (error) {
      console.log(error);
    }
  }
  render() {
    // console.log(this.state);
    // const { coords = ({ longitude, latitude } = {}) } = this.state.position;

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
            Last recieved location as of: 7:32 pm
          </Text>
        </View>
      </View>
    );
  }
}

export default Screen;

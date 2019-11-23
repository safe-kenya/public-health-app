import Geolocation from "react-native-geolocation-service";
import { PermissionsAndroid, AsyncStorage } from "react-native";
import { ToastAndroid } from "react-native";
import emitize from "./emitize";
import { query, mutate } from "./requests";

const studentsData = [];
const parentsData = [];
const busesData = [];
const driversData = [];
const driverData = {};
const routesData = [];
const schedulesData = [];
const parentData = { students: [] };

var Data = (async function() {
  var instance;

  // local variables to keep a cache of every entity
  var students = studentsData;
  var parents = parentsData;
  var drivers = driversData;
  var driver = driverData;
  var parent = parentData;
  var buses = busesData;
  var routes = routesData;
  var schedules = schedulesData;
  var locationWatchId = null;
  var manualWatchId = null;

  // subscriptions for every entity to keep track of everyone subscribing to any data
  var subs = {};
  emitize(subs, "students");
  emitize(subs, "parents");
  emitize(subs, "drivers");
  emitize(subs, "buses");
  emitize(subs, "routes");
  emitize(subs, "schedules");
  emitize(subs, "driver");
  emitize(subs, "parent");

  // subs.students = log; //subscribe to events (named 'x') with cb (log)
  // //another subscription won't override the previous one
  // subs.students = logPlus1;
  // subs.students(9); //emits '9' to all listeners;

  // when the data store gets innitialized, fetch all data and store in cache
  const fetch = async () => {
    const response = await query(`{
      driver{
        id
        username
      }
      parent {
        id
        name
        gender
        students {
          id
          names
          gender
          events {
            id
            type
            time
            trip {
              locReports{
                id,
                time
                loc{
                  lat,
                  lng
                }
              }
              schedule {
                id
                name
                time
                end_time
              }
            }
          }
        }
      }
      schedules {
        id
        time
        name
        days
        bus{
          make
          plate
        }
        route {
          id
          name
          students {
            id
            names
            gender
            route {
              name
            }
            parent {
              phone
              gender
            },
            parent2 {
              phone
              gender
            }
          }
        }
      }
    }`);

    if (response.schedules) {
      schedules = response.schedules;
      subs.schedules({ schedules });
    }

    if (response.parents) {
      parents = response.parents;
      subs.parents({ parents });
    }

    if (response.drivers) {
      drivers = response.drivers;
      subs.drivers({ drivers });
    }

    if (response.driver) {
      driver = response.driver;
      subs.driver({ driver });
    }

    if (response.parent) {
      parent = response.parent;
      subs.parent({ parent });
    }

    return response;
  };

  if (await AsyncStorage.getItem("authorization")) fetch();

  await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.READ_SMS
  ]);

  function createInstance() {
    var object = new Object("Instance here");
    return object;
  }

  return {
    refetch: () => fetch(),
    getInstance: function() {
      if (!instance) {
        instance = createInstance();
      }

      return instance;
    },
    driver: {
      get() {
        return driver;
      },
      subscribe(cb) {
        subs.driver = cb;
        return driver;
      },
      getOne(id) {}
    },
    parent: {
      get() {
        return parent;
      },
      subscribe(cb) {
        subs.parent = cb;
        return parent;
      },
      getOne(id) {}
    },
    schedules: {
      create: schedule =>
        new Promise(async (resolve, reject) => {
          schedule.days = schedule.days.join(",");

          const { id } = await mutate(
            `
          mutation ($schedule: Ischedule!) {
            schedules {
              create(schedule: $schedule) {
                id
              }
            }
          }            
        `,
            {
              schedule
            }
          );

          schedule.id = id;
          schedule.days = schedule.days.split(",");
          schedule.route = routes.filter(
            route => route.id === schedule.route
          )[0];
          schedule.bus = buses.filter(bus => bus.id === schedule.bus)[0];
          schedules = [...schedules, schedule];
          subs.schedules({ schedules });
          resolve();
        }),
      update: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
          mutation ($Ischedule: Ischedule!) {
            schedules {
              create(schedule: $Ischedule) {
                id
              }
            }
          }            
        `,
            {
              schedule: data
            }
          );

          const subtract = schedules.filter(({ id }) => id !== data.id);
          schedules = [data, ...subtract];
          subs.schedules({ schedules });
          resolve();
        }),
      delete: schedule =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
          mutation ($Ischedule: Uschedule!) {
            schedules {
              archive(schedule: $Ischedule) {
                id
              }
            }
          }                  
        `,
            {
              Ischedule: {
                id: schedule.id
              }
            }
          );

          const subtract = schedules.filter(({ id }) => id !== schedule.id);
          schedules = [...subtract];
          subs.schedules({ schedules });
          resolve();
        }),
      list() {
        return schedules;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.schedules = cb;
        return schedules;
      },
      getOne(id) {}
    },
    events: {
      create: event =>
        new Promise(async (resolve, reject) => {
          const { id } = await mutate(
            `
            mutation ($Ievent: Ievent!) {
              events {
                create(event: $Ievent) {
                  id
                }
              }
            }           
        `,
            {
              Ievent: event
            }
          );

          resolve();
        })
    },
    trips: {
      start(id) {
        return new Promise(async (resolve, reject) => {
          const res = await mutate(
            `
            mutation ($Itrip: Itrip!) {
              trips {
                create(trip: $Itrip) {
                  id
                }
              }
            }       
        `,
            {
              Itrip: {
                startedAt: new Date().toISOString(),
                schedule: id
              }
            }
          );

          resolve(res.trips.create.id);

          const sendToServer = async (lat, lng) => {
            await mutate(
              `
                mutation ($IlocReport: IlocReport!) {
                  locReports {
                    create(locreport: $IlocReport) {
                      id
                    }
                  }
                }
            `,
              {
                IlocReport: {
                  trip: res.trips.create.id,
                  time: new Date().toLocaleTimeString(),
                  loc: {
                    lat,
                    lng
                  }
                }
              }
            );
          };

          ToastAndroid.show("Starting get location", ToastAndroid.SHORT);

          manualWatchId = setInterval(() => {
            Geolocation.getCurrentPosition(
              async position => {
                const {
                  coords: { longitude: lng, latitude: lat }
                } = position;
                // ToastAndroid.show(
                //   "fetch loc:" + JSON.stringify({ lat, lng }),
                //   ToastAndroid.SHORT
                // );
                sendToServer(lat, lng);
              },
              error => {
                ToastAndroid.show(
                  "error getting current location!" + JSON.stringify(error),
                  ToastAndroid.SHORT
                );
              },
              { enableHighAccuracy: true, timeout: 25000, maximumAge: 3600000 }
            );
          }, 300000);

          ToastAndroid.show("Starting watch location", ToastAndroid.SHORT);

          // start watching teh gps position and sending it to the api
          locationWatchId = Geolocation.watchPosition(
            async position => {
              const {
                coords: { longitude: lng, latitude: lat }
              } = position;
              ToastAndroid.show(
                "new watch loc recieved:" + JSON.stringify({ lat, lng }),
                ToastAndroid.SHORT
              );
              sendToServer(lat, lng);
            },
            error => {
              ToastAndroid.show(
                "Error watching current location!" + JSON.stringify(error),
                ToastAndroid.SHORT
              );
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        });
      },
      finish(id) {
        return new Promise(async (resolve, reject) => {
          const res = await mutate(
            `
            mutation ($trip: Utrip!) {
              trips {
                update(trip: $trip) {
                  id
                }
              }
            }                  
        `,
            {
              trip: {
                id,
                completedAt: new Date().toISOString()
              }
            }
          );

          Geolocation.clearWatch(locationWatchId);
          clearInterval(manualWatchId);
          resolve();
        });
      },
      cancel(id) {
        return new Promise(async (resolve, reject) => {
          await mutate(
            `
            mutation ($Itrip: Itrip!) {
              trips {
                create(trip: $Itrip) {
                  id
                }
              }
            }          
        `,
            {
              Itrip: {
                isCancelled: true,
                id
              }
            }
          );

          resolve();
        });
      },
      list() {
        return [];
      },
      getOne(id) {}
    },
    complaints: {
      send(message) {
        return new Promise(async (resolve, reject) => {
          const res = await mutate(
            `
            mutation ($Icomplaint: Icomplaint!) {
              complaints {
                create(complaint: $Icomplaint) {
                  id,
                  time,
                  parent{
                    id
                  }
                }
              }
            }          
        `,
            {
              Icomplaint: {
                time: new Date().toLocaleTimeString(),
                content: message[0].text
              }
            }
          );

          resolve(res);
        });
      },
      delete(id) {
        return;
      },
      list() {
        return [];
      },
      getOne(id) {}
    }
  };
})();

export default Data;

import Geolocation from "react-native-geolocation-service";
import { PermissionsAndroid } from "react-native";
import { ToastAndroid } from "react-native";
import emitize from "./emitize";
import { query, mutate } from "./requests";

const studentsData = [];
const parentsData = [];
const bussesData = [];
const driversData = [];
const driverData = {};
const routesData = [];
const schedulesData = [];
const parentData = [];

export async function requestLocationPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Example App",
        message: "Example App access to your location "
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use the location");
    } else {
      console.log("location permission denied");
    }
  } catch (err) {
    console.warn(err);
  }
}

var Data = (function() {
  var instance;

  // local variables to keep a cache of every entity
  var students = studentsData;
  var parents = parentsData;
  var drivers = driversData;
  var driver = driverData;
  var parent = parentData;
  var busses = bussesData;
  var routes = routesData;
  var schedules = schedulesData;
  var locationWatchId = null;
  var manualWatchId = null;

  // subscriptions for every entity to keep track of everyone subscribing to any data
  var subs = {};
  emitize(subs, "students");
  emitize(subs, "parents");
  emitize(subs, "drivers");
  emitize(subs, "busses");
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
      drivers{
        id
        username
      }
      driver{
        id
        username
      }
      parent {
        id
        name
      }
      parents {
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

    schedules = response.schedules;
    subs.schedules({ schedules });

    parents = response.parents;
    subs.parents({ parents });

    drivers = response.drivers;
    subs.drivers({ drivers });

    driver = response.driver;
    subs.driver({ driver });

    parent = response.parent;
    subs.parent({ parent });
  };

  fetch();
  requestLocationPermission();

  function createInstance() {
    var object = new Object("Instance here");
    return object;
  }

  return {
    async refetch() {
      fetch();
    },
    getInstance: function() {
      if (!instance) {
        instance = createInstance();
      }

      return instance;
    },
    auth: {
      login(id) {
        return {};
      },
      getUser(id) {
        return {};
      },
      logout(id, data) {
        return;
      }
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
    students: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const { id } = await mutate(
            `
          mutation ($Istudent: Istudent!) {
            students {
              create(student: $Istudent) {
                id
              }
            }
          }`,
            {
              Istudent: data
            }
          );

          data.id = id;

          data.parent = parents.filter(p => p.id === data.parent)[0].name;
          data.route = routes.filter(p => p.id === data.route)[0].name;

          students = [...students, data];
          subs.students({ students });
          resolve();
        }),
      update: data =>
        new Promise(async (resolve, reject) => {
          const { id } = await mutate(
            `
          mutation ($student: Ustudent!) {
            students {
              update(student: $student) {
                id
              }
            }
          } `,
            {
              student: data
            }
          );

          data.id = id;

          const subtract = students.filter(({ id }) => id !== data.id);
          students = [data, ...subtract];
          subs.students({ students });
          resolve();
        }),
      delete: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
          mutation ($Istudent: Ustudent!) {
            students {
              archive(student: $Istudent) {
                id
              }
            }
          }  `,
            {
              Istudent: {
                id: data.id
              }
            }
          );

          const subtract = students.filter(({ id }) => id !== data.id);
          students = [...subtract];
          subs.students({ students });
          resolve();
        }),
      list() {
        return students;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.students = cb;
        return students;
      },
      getOne(id) {}
    },
    parents: {
      list() {
        return parents;
      },
      subscribe(cb) {
        subs.parents = cb;
        return parents;
      },
      getOne(id) {}
    },
    drivers: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const { id } = await mutate(
            `
            mutation ($Idriver: Idriver!) {
              drivers {
                create(driver: $Idriver) {
                  id
                }
              }
            }`,
            {
              Idriver: data
            }
          );

          data.id = id;

          drivers = [...drivers, data];
          subs.drivers({ drivers });
          resolve();
        }),
      update: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
          mutation ($driver: Udriver!) {
            drivers {
              update(driver: $driver) {
                id
              }
            }
          } 
          `,
            {
              driver: data
            }
          );

          const subtract = drivers.filter(({ id }) => id !== data.id);
          drivers = [data, ...subtract];
          subs.drivers({ drivers });
          resolve();
        }),
      delete: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `
          mutation ($Idriver: Udriver!) {
            drivers {
              archive(driver: $Idriver) {
                id
              }
            }
          } 
          `,
            {
              Idriver: {
                id: data.id
              }
            }
          );

          const subtract = drivers.filter(({ id }) => id !== data.id);
          drivers = [...subtract];
          subs.drivers({ drivers });
          resolve();
        }),
      list() {
        return drivers;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.drivers = cb;
        return drivers;
      },
      getOne(id) {}
    },
    busses: {
      create: bus =>
        new Promise(async (resolve, reject) => {
          const { id } = await mutate(
            `mutation ($bus: Ibus!) {
            buses {
              create(bus: $bus) {
                id
              }
            }
          }`,
            {
              bus
            }
          );

          bus.id = id;
          busses = [...busses, bus];
          subs.busses({ busses });
          resolve();
        }),
      update: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `mutation ($bus: Ubus!) {
            buses {
              update(bus: $bus) {
                id
              }
            }
          }`,
            {
              bus: data
            }
          );

          const subtract = busses.filter(({ id }) => id !== data.id);
          busses = [data, ...subtract];
          subs.busses({ busses });
          resolve();
        }),
      delete: bus =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `mutation ($Ibus: Ubus!) {
            buses {
              archive(bus: $Ibus) {
                id
              }
            }
          }  `,
            {
              Ibus: {
                id: bus.id
              }
            }
          );

          const subtract = busses.filter(({ id }) => id !== bus.id);
          busses = [...subtract];
          subs.busses({ busses });
          resolve();
        }),
      list() {
        return busses;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.busses = cb;
        return busses;
      },
      getOne(id) {}
    },
    routes: {
      create: data =>
        new Promise(async (resolve, reject) => {
          const { id } = await mutate(
            `
            mutation ($Iroute: Iroute!) {
              routes {
                create(route: $Iroute) {
                  id
                }
              }
            }`,
            {
              Iroute: data
            }
          );

          data.id = id;
          routes = [...routes, data];
          subs.routes({ routes });
          resolve();
        }),
      update: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `mutation ($route: Uroute!) {
            routes {
              update(route: $route) {
                id
              }
            }
          } `,
            {
              route: {
                id: data.id,
                name: data.name
              }
            }
          );

          const subtract = routes.filter(({ id }) => id !== data.id);
          routes = [data, ...subtract];
          subs.routes({ routes });
          resolve();
        }),
      delete: data =>
        new Promise(async (resolve, reject) => {
          await mutate(
            `mutation ($Iroute: Uroute!) {
            routes {
              archive(route: $Iroute) {
                id
              }
            }
          }`,
            {
              Iroute: {
                id: data.id
              }
            }
          );

          const subtract = routes.filter(({ id }) => id !== data.id);
          routes = [...subtract];
          subs.routes({ routes });
          resolve();
        }),
      list() {
        return routes;
      },
      subscribe(cb) {
        // listen for even change on the students observables
        subs.routes = cb;
        return routes;
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
          schedule.bus = busses.filter(bus => bus.id === schedule.bus)[0];
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
        new Promise(async (resolve, reject) => {
          Geolocation.clearWatch(locationWatchId);
          clearInterval.clearWatch(manualWatchId);

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
                completedAt: new Date().toISOString(),
                schedule: id
              }
            }
          );

          resolve();
        });
      },
      cancel(id) {
        new Promise(async (resolve, reject) => {
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
                schedule: id
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
    },
    communication: {
      sms: {
        create(id) {
          return {};
        },
        update(id, data) {
          return;
        },
        delete(id) {
          return;
        },
        list() {
          return [];
        },
        getOne(id) {}
      },
      email: {
        create(id) {
          return {};
        },
        update(id, data) {
          return;
        },
        delete(id) {
          return;
        },
        list() {
          return [];
        },
        getOne(id) {}
      }
    }
  };
})();

export default Data;

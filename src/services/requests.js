import axios from "axios";
import { AsyncStorage } from "react-native";

let API;

if (__DEV__) {
  API = `http://10.0.3.2:4000`;
  // API = `https://development-smartkids.herokuapp.com`;
} else {
  API = `https://development-smartkids.herokuapp.com`;
}

const query = (query, params) => {
  // make request to the server
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { data }
      } = await axios.post(
        `${API}/graph`,
        {
          query
        },
        {
          headers: {
            authorization: await AsyncStorage.getItem("authorization")
          }
        }
      );

      resolve(data);
    } catch (error) {
      console.log(error);
      if (error.response) return reject(error.response.data.errors);

      reject(error);
    }
  });
};

const mutate = (query, variables) => {
  // make request to the server
  return new Promise(async (resolve, reject) => {
    try {
      const {
        data: { data }
      } = await axios.post(
        `${API}/graph`,
        {
          query,
          variables
        },
        {
          headers: {
            authorization: await AsyncStorage.getItem("authorization")
          }
        }
      );

      resolve(data);
    } catch (error) {
      reject(error.response.data.errors);
    }
  });
};

export { query, mutate, API };

import Login from "./activities/auth/parent";
import driverLogin from "./activities/auth/driver";
import ParentHome from "./activities/parent/home";
import AgentHome from "./activities/agent/home";

const App = {
  ParentHome: {
    screen: ParentHome,
    navigationOptions: {
      header: null
    }
  },
  DriverHome: {
    screen: AgentHome,
    navigationOptions: {
      header: null
    }
  }
};

const Auth = {
  ParentLogin: {
    screen: Login,
    navigationOptions: {
      header: null
    }
  },
  DriverLogin: {
    screen: driverLogin,
    navigationOptions: {
      header: null
    }
  }
};

export { App, Auth };

import ParentLogin from "./activities/auth/parent";
import DriverLogin from "./activities/auth/driver";
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
    screen: ParentLogin,
    navigationOptions: {
      header: null
    }
  },
  DriverLogin: {
    screen: DriverLogin,
    navigationOptions: {
      header: null
    }
  }
};

export { App, Auth };

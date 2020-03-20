import Login from "./activities/auth/login";
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
  Login: {
    screen: Login,
    navigationOptions: {
      header: null
    }
  }
};

export { App, Auth };

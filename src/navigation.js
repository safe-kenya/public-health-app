import Login from "./activities/auth/login";
import driverLogin from "./activities/auth/driver_login";
import accountRecover from "./activities/auth/recover";
import ParentHome from "./activities/parent/home";
import AgentHome from "./activities/agent/home";

export default {
  Login: {
    screen: Login,
    navigationOptions: {
      header: null
    }
  },
  driverLogin: {
    screen: driverLogin,
    navigationOptions: {
      header: null
    }
  },
  ParentHome: {
    screen: ParentHome,
    navigationOptions: {
      header: null
    }
  },
  accountRecover: {
    screen: accountRecover,
    navigationOptions: {
      header: null
    }
  },
  AgentHome: {
    screen: AgentHome,
    navigationOptions: {
      header: null
    }
  }
};

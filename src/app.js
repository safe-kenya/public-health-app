import navigationStructure from "./navigation";
import { createAppContainer, createStackNavigator } from "react-navigation";

export const AppNavigator = createStackNavigator(navigationStructure);

export default createAppContainer(AppNavigator);

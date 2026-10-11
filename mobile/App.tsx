import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import CreateRecipeScreen from "./src/screens/CreateRecipeScreen";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  CreateRecipe: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fffaf4",
        }}
      >
        <ActivityIndicator size="large" color="#515726" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
{user ? (
  <>
    <Stack.Screen name="Home">
      {(props) => (
        <HomeScreen
          onAddRecipe={() => props.navigation.navigate("CreateRecipe")}
          onOpenRecipe={(id) => {
            // просмотр позже
          }}
        />
      )}
    </Stack.Screen>
    <Stack.Screen name="CreateRecipe">
      {(props) => (
        <CreateRecipeScreen
          onGoHome={() => props.navigation.navigate("Home")}
        />
      )}
    </Stack.Screen>
  </>
) : (
  // Login / Register как были
        <>
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen
                onGoRegister={() => props.navigation.navigate("Register")}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {(props) => (
              <RegisterScreen
                onGoLogin={() => props.navigation.navigate("Login")}
              />
            )}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
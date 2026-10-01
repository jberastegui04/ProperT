import { useAuth } from "@clerk/expo";
import { useHostedAuth } from "@clerk/expo/hosted-auth";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function HomeScreen() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { startHostedAuth } = useHostedAuth();

  async function handleSignIn() {
    try {
      await startHostedAuth({
        mode: "sign-in",
      });
    } catch (error) {
      console.error("Sign in failed:", error);
    }
  }

  async function handleSignUp() {
    try {
      await startHostedAuth({
        mode: "sign-up",
      });
    } catch (error) {
      console.error("Sign up failed:", error);
    }
  }

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ProperT</Text>

      {isSignedIn ? (
        <>
          <Text style={styles.success}>
            You are signed in.
          </Text>

          <Button
            title="Sign Out"
            onPress={() => signOut()}
          />
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>
            Property operations, simplified.
          </Text>

          <Button
            title="Sign In"
            onPress={handleSignIn}
          />

          <Button
            title="Create Account"
            onPress={handleSignUp}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  title: {
    fontSize: 36,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },

  success: {
    fontSize: 18,
    fontWeight: "600",
  },
});
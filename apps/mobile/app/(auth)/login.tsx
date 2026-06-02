import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useAuth } from '../../src/auth/auth-context';
import { colors } from '../../src/theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)/tours');
    } catch (err) {
      const e = err as {
        message?: string;
        response?: { data?: { message?: string }; status?: number };
      };
      setError(
        e.response?.data?.message ??
          (e.response
            ? `HTTP ${e.response.status} — ${JSON.stringify(e.response.data)}`
            : e.message ?? 'Login failed'),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Natours</Text>
      <Text style={styles.title}>Welcome back</Text>

      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        label="Password"
        mode="outlined"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={loading}
        disabled={loading || !email || !password}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Sign in
      </Button>

      <Link href="/(auth)/signup" style={styles.link}>
        Don't have an account? Sign up
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', gap: 8 },
  brand: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.brand,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: { marginBottom: 6 },
  error: { color: colors.danger, textAlign: 'center', marginVertical: 4 },
  button: { marginTop: 8, borderRadius: 6 },
  buttonContent: { paddingVertical: 6 },
  link: { color: colors.brandDark, textAlign: 'center', marginTop: 16 },
});

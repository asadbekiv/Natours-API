import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useAuth } from '../../src/auth/auth-context';
import { colors } from '../../src/theme';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        passwordConfirm,
      });
      router.replace('/(tabs)/tours');
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? 'Signup failed',
      );
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    !!name && !!email && password.length >= 6 && password === passwordConfirm;

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Natours</Text>
      <Text style={styles.title}>Create your account</Text>

      <TextInput
        label="Name"
        mode="outlined"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
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
      <TextInput
        label="Confirm password"
        mode="outlined"
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        secureTextEntry
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={loading}
        disabled={loading || !canSubmit}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Sign up
      </Button>

      <Link href="/(auth)/login" style={styles.link}>
        Already have an account? Sign in
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

import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useAuth } from '../../src/auth/auth-context';
import { colors } from '../../src/theme';

export default function MeScreen() {
  const { user, signOut } = useAuth();

  async function onLogout() {
    await signOut();
    router.replace('/(auth)/login');
  }

  if (!user) {
    return null;
  }

  const photoUrl = /^https?:\/\//i.test(user.photo ?? '') ? user.photo : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {photoUrl ? (
          <Image source={photoUrl} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>
              {user.name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.role}>{user.role}</Text>
      </View>

      <Button
        mode="outlined"
        onPress={onLogout}
        style={styles.button}
        textColor={colors.danger}
      >
        Sign out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  header: { alignItems: 'center', marginTop: 24 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#eee',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: '#fff', fontSize: 36, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: colors.textDark },
  email: { color: colors.textMuted, marginTop: 4 },
  role: {
    color: colors.brandDark,
    marginTop: 6,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  button: { marginTop: 40, borderColor: colors.danger },
});

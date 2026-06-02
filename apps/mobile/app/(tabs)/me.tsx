import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import type { User } from '@natours/shared';
import { useAuth } from '../../src/auth/auth-context';
import { api } from '../../src/api/client';
import { colors } from '../../src/theme';

export default function MeScreen() {
  const { user, signOut, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLogout() {
    await signOut();
    router.replace('/(auth)/login');
  }

  async function onPickPhoto() {
    setError(null);

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Photo library access denied.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (result.canceled) return;
    const asset = result.assets[0];

    setUploading(true);
    try {
      const form = new FormData();
      // React Native's FormData accepts this `{ uri, name, type }` shape for files.
      form.append('photo', {
        uri: asset.uri,
        name: asset.fileName ?? 'photo.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      } as unknown as Blob);

      const res = await api.patch<{ data: User }>('/users/updateMe', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(res.data.data);
    } catch (err) {
      const e = err as {
        message?: string;
        response?: { data?: { message?: string }; status?: number };
      };
      setError(
        e.response?.data?.message ??
          (e.response
            ? `HTTP ${e.response.status} — ${JSON.stringify(e.response.data)}`
            : e.message ?? 'Upload failed'),
      );
    } finally {
      setUploading(false);
    }
  }

  if (!user) return null;

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
        mode="contained"
        onPress={onPickPhoto}
        loading={uploading}
        disabled={uploading}
        style={styles.uploadBtn}
        contentStyle={styles.btnContent}
      >
        {uploading ? 'Uploading…' : 'Update photo'}
      </Button>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        mode="outlined"
        onPress={onLogout}
        style={styles.logoutBtn}
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
  uploadBtn: { marginTop: 32, borderRadius: 6 },
  btnContent: { paddingVertical: 6 },
  error: { color: colors.danger, marginTop: 8, textAlign: 'center' },
  logoutBtn: { marginTop: 16, borderColor: colors.danger },
});

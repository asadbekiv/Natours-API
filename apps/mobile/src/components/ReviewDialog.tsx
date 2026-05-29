import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { colors } from '../theme';

interface Props {
  visible: boolean;
  /** Tour the review is for. Required when visible. */
  tourId: string | undefined;
  /** Optional title above the form. */
  tourName?: string;
  onClose: () => void;
  /** Called after a successful POST; use it to show a toast, refetch, etc. */
  onSubmitted?: () => void;
}

/**
 * "Leave a review" dialog: 5-star picker + multiline text → POST
 * /tours/:tourId/reviews. Invalidates the tour query so the new review
 * appears on the tour-detail screen next time it's read.
 */
export function ReviewDialog({
  visible,
  tourId,
  tourName,
  onClose,
  onSubmitted,
}: Props) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!tourId) throw new Error('No tour for this review');
      await api.post(`/tours/${tourId}/reviews`, {
        rating,
        review: text,
      });
    },
    onSuccess: () => {
      if (tourId) {
        void queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      }
      onSubmitted?.();
      handleClose();
    },
    onError: (err) => {
      const e = err as {
        message?: string;
        response?: { data?: { message?: string }; status?: number };
      };
      setError(
        e.response?.data?.message ??
          (e.response
            ? `HTTP ${e.response.status} — ${JSON.stringify(e.response.data)}`
            : e.message ?? 'Could not submit review'),
      );
    },
  });

  function handleClose() {
    setRating(5);
    setText('');
    setError(null);
    mutation.reset();
    onClose();
  }

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose}>
        <Dialog.Title>Leave a review</Dialog.Title>
        <Dialog.Content>
          {tourName ? <Text style={styles.tourName}>{tourName}</Text> : null}
          <StarPicker value={rating} onChange={setRating} />
          <TextInput
            mode="outlined"
            label="Your review"
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={4}
            style={styles.input}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleClose}>Cancel</Button>
          <Button
            mode="contained"
            onPress={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={mutation.isPending || text.trim().length === 0}
          >
            Submit
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Pressable
          key={i}
          onPress={() => onChange(i)}
          style={styles.starPress}
          accessibilityLabel={`${i} star${i === 1 ? '' : 's'}`}
        >
          <Ionicons
            name={i <= value ? 'star' : 'star-outline'}
            size={32}
            color={i <= value ? colors.star : '#d8d8d8'}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tourName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 12,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  starPress: { paddingHorizontal: 6 },
  input: { backgroundColor: '#fff' },
  error: { color: colors.danger, marginTop: 8 },
});

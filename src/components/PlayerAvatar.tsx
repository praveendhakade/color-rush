import { StyleSheet, Text, View } from 'react-native';

export const AVATARS = [
  { id: 'sunny', emoji: '🌞', accent: '#FDE047' },
  { id: 'fox', emoji: '🦊', accent: '#FB923C' },
  { id: 'cat', emoji: '🐱', accent: '#F472B6' },
  { id: 'dog', emoji: '🐶', accent: '#4DEBFF' },
  { id: 'panda', emoji: '🐼', accent: '#A78BFA' },
  { id: 'tiger', emoji: '🐯', accent: '#FB923C' },
  { id: 'frog', emoji: '🐸', accent: '#4ADE80' },
  { id: 'bear', emoji: '🐻', accent: '#C084FC' },
  { id: 'rabbit', emoji: '🐰', accent: '#F9A8D4' },
  { id: 'unicorn', emoji: '🦄', accent: '#C4B5FD' },
  { id: 'alien', emoji: '👾', accent: '#4DEBFF' },
  { id: 'robot', emoji: '🤖', accent: '#93C5FD' },
  { id: 'rocket', emoji: '🚀', accent: '#FB7185' },
  { id: 'star', emoji: '⭐', accent: '#FDE047' },
  { id: 'rainbow', emoji: '🌈', accent: '#F472B6' },
  { id: 'fire', emoji: '🔥', accent: '#FB923C' },
] as const;

export const resolveAvatar = (avatarId: string) =>
  AVATARS.find((avatar) => avatar.id === avatarId) ?? AVATARS[0]!;

export const getAvatarAccent = (avatarId: string) =>
  resolveAvatar(avatarId).accent;

export const PlayerAvatar = ({
  avatarId,
  size = 52,
}: {
  avatarId: string;
  size?: number;
}) => {
  const avatar = resolveAvatar(avatarId);
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: avatar.accent,
          backgroundColor: `${avatar.accent}22`,
        },
      ]}
    >
      <Text style={{ fontSize: size * 0.56 }}>{avatar.emoji}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderWidth: 2,
    justifyContent: 'center',
  },
});

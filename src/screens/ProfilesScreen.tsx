import { useEffect, useState } from 'react';
import {
  Animated,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PlayerAvatar, AVATARS } from '@/src/components/PlayerAvatar';
import { PlayerCard } from '@/src/components/PlayerCard';
import { ArcadeBackground } from '@/src/components/ArcadeBackground';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import {
  MAX_PLAYER_NAME_LENGTH,
  type PlayerProfile,
} from '@/src/services/Persistence';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';

const AvatarChoice = ({
  avatar,
  selected,
  reducedMotion,
  onPress,
}: {
  avatar: (typeof AVATARS)[number];
  selected: boolean;
  reducedMotion: boolean;
  onPress: () => void;
}) => {
  const [scale] = useState(() => new Animated.Value(1));
  useEffect(() => {
    if (reducedMotion) {
      scale.setValue(1);
      return;
    }
    Animated.spring(scale, {
      toValue: selected ? 1.06 : 1,
      friction: 5,
      tension: 180,
      useNativeDriver: true,
    }).start();
  }, [reducedMotion, scale, selected]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Avatar ${avatar.id}`}
      accessibilityState={{ selected }}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.avatarChoice,
          {
            borderColor: selected ? avatar.accent : '#403958',
            transform: [{ scale }],
          },
        ]}
      >
        <PlayerAvatar avatarId={avatar.id} size={42} />
        {selected && (
          <View
            style={[styles.selectedMark, { backgroundColor: avatar.accent }]}
          >
            <Text style={styles.check}>✓</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

export const ProfilesScreen = ({
  profiles,
  activeProfileId,
  onboarding = false,
  onBack,
  onActivate,
  onSave,
  onDelete,
}: {
  profiles: PlayerProfile[];
  activeProfileId: string | null;
  onboarding?: boolean;
  onBack: () => void;
  onActivate: (id: string) => void;
  onSave: (
    profile: PlayerProfile | null,
    name: string,
    avatarId: string,
  ) => void;
  onDelete: (profile: PlayerProfile) => void;
}) => {
  const [editing, setEditing] = useState<PlayerProfile | null>(null);
  const [creating, setCreating] = useState(onboarding);
  const [name, setName] = useState('');
  const [avatarId, setAvatarId] = useState('sunny');
  const [error, setError] = useState('');
  const reducedMotion = useReducedMotion();
  const begin = (profile: PlayerProfile | null) => {
    setEditing(profile);
    setCreating(!profile);
    setName(profile?.name ?? '');
    setAvatarId(profile?.avatarId ?? 'sunny');
    setError('');
  };
  const save = () => {
    const cleaned = name.trim();
    if (!cleaned) {
      setError('Enter a player name.');
      return;
    }
    if (
      profiles.some(
        (p) =>
          p.id !== editing?.id &&
          p.name.toLocaleLowerCase() === cleaned.toLocaleLowerCase(),
      )
    ) {
      setError('That name is already used. Choose a different name.');
      return;
    }
    onSave(editing, cleaned.slice(0, MAX_PLAYER_NAME_LENGTH), avatarId);
    setCreating(false);
    setEditing(null);
    setName('');
  };
  const confirmDelete = (profile: PlayerProfile) =>
    Alert.alert(
      'Delete player?',
      `Delete ${profile.name} and their scores and statistics?`,
      [
        { text: 'CANCEL', style: 'cancel' },
        {
          text: 'DELETE',
          style: 'destructive',
          onPress: () => onDelete(profile),
        },
      ],
    );

  return (
    <ArcadeBackground>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          {onboarding
            ? 'WELCOME!'
            : creating || editing
              ? editing
                ? 'EDIT PLAYER'
                : 'NEW PLAYER'
              : 'PLAYERS'}
        </Text>
        <Text style={styles.subtitle}>
          {onboarding
            ? 'One device. Your crew. Your high scores.'
            : creating || editing
              ? 'Make it yours.'
              : 'Pick who is playing today.'}
        </Text>
        {creating || editing ? (
          <>
            <View style={styles.preview}>
              <PlayerAvatar avatarId={avatarId} size={82} />
            </View>
            <TextInput
              accessibilityLabel="Player name"
              autoFocus
              value={name}
              onChangeText={(value) => {
                setName(value.slice(0, MAX_PLAYER_NAME_LENGTH));
                setError('');
              }}
              maxLength={MAX_PLAYER_NAME_LENGTH}
              placeholder="Your name"
              placeholderTextColor="#9994BA"
              style={styles.input}
            />
            <Text style={styles.hint}>CHOOSE AN AVATAR</Text>
            <View style={styles.grid}>
              {AVATARS.map((avatar) => (
                <AvatarChoice
                  key={avatar.id}
                  avatar={avatar}
                  selected={avatar.id === avatarId}
                  reducedMotion={reducedMotion}
                  onPress={() => setAvatarId(avatar.id)}
                />
              ))}
            </View>
            {!!error && (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            )}
            <PrimaryButton
              label={onboarding ? 'CREATE PLAYER' : 'SAVE'}
              onPress={save}
            />
            {!onboarding && (
              <PrimaryButton
                label="CANCEL"
                onPress={() => {
                  setCreating(false);
                  setEditing(null);
                }}
              />
            )}
          </>
        ) : (
          <>
            {profiles.map((profile) => (
              <PlayerCard
                key={profile.id}
                profile={profile}
                active={profile.id === activeProfileId}
                detail={`${profile.id === activeProfileId ? 'ACTIVE  ·  ' : ''}BEST ${profile.statistics.bestScore}  ·  ${profile.statistics.gamesPlayed} GAMES`}
                style={styles.profileCard}
                minIdentityWidth={104}
              >
                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${profile.name}`}
                    onPress={() => begin(profile)}
                    style={styles.smallAction}
                  >
                    <Text style={styles.action}>EDIT</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${profile.name}`}
                    onPress={() => confirmDelete(profile)}
                    style={[styles.smallAction, styles.deleteAction]}
                  >
                    <Text style={styles.delete}>DEL</Text>
                  </Pressable>
                </View>
                {profile.id !== activeProfileId && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Switch to ${profile.name}`}
                    onPress={() => onActivate(profile.id)}
                    style={styles.useButton}
                  >
                    <Text style={styles.switchText}>PLAY</Text>
                  </Pressable>
                )}
              </PlayerCard>
            ))}
            <PrimaryButton label="ADD PLAYER" onPress={() => begin(null)} />
            <PrimaryButton label="BACK" onPress={onBack} />
          </>
        )}
      </ScrollView>
    </ArcadeBackground>
  );
};

const styles = StyleSheet.create({
  content: { alignItems: 'center', flexGrow: 1, gap: 15, padding: 22 },
  title: { color: '#FFF', fontSize: 30, fontWeight: '900', marginTop: 14 },
  subtitle: {
    color: '#AAA4C5',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
  },
  preview: {
    alignItems: 'center',
    backgroundColor: '#211B3B',
    borderColor: '#41375C',
    borderRadius: 28,
    borderWidth: 1,
    padding: 15,
  },
  input: {
    alignSelf: 'stretch',
    backgroundColor: '#1B1731',
    borderColor: '#494064',
    borderRadius: 16,
    borderWidth: 1,
    color: '#FFF',
    fontSize: 18,
    padding: 15,
    textAlign: 'center',
  },
  hint: {
    color: '#A78BFA',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  grid: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    justifyContent: 'center',
  },
  avatarChoice: {
    alignItems: 'center',
    backgroundColor: '#211B3B',
    borderRadius: 19,
    borderWidth: 2,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  selectedMark: {
    alignItems: 'center',
    borderColor: '#100D24',
    borderRadius: 9,
    borderWidth: 2,
    height: 19,
    justifyContent: 'center',
    position: 'absolute',
    right: -5,
    top: -5,
    width: 19,
  },
  check: { color: '#100D24', fontSize: 12, fontWeight: '900' },
  error: { color: '#FDA4AF', fontSize: 14, fontWeight: '700' },
  profileCard: { alignSelf: 'stretch', flexWrap: 'wrap', padding: 11 },
  actions: { flexDirection: 'row', gap: 5 },
  smallAction: {
    alignItems: 'center',
    backgroundColor: '#30294C',
    borderRadius: 9,
    justifyContent: 'center',
    minHeight: 38,
    minWidth: 40,
    paddingHorizontal: 7,
  },
  deleteAction: { backgroundColor: '#3B203C' },
  action: { color: '#D7D0F4', fontSize: 9, fontWeight: '900' },
  delete: { color: '#F9A8D4', fontSize: 9, fontWeight: '900' },
  useButton: {
    alignItems: 'center',
    backgroundColor: '#4DEBFF',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 12,
  },
  switchText: { color: '#100D24', fontSize: 10, fontWeight: '900' },
});

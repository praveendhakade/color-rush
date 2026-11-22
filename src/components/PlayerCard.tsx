import type { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { getAvatarAccent, PlayerAvatar } from './PlayerAvatar';
import type { PlayerProfile } from '../services/Persistence';

export const PlayerCard = ({
  profile,
  detail,
  active = false,
  children,
  style,
  minIdentityWidth = 0,
}: {
  profile: PlayerProfile;
  detail: string;
  active?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  minIdentityWidth?: number;
}) => {
  const accent = getAvatarAccent(profile.avatarId);
  return (
    <View
      style={[styles.card, { borderColor: active ? accent : '#332C50' }, style]}
    >
      <PlayerAvatar avatarId={profile.avatarId} size={52} />
      <View style={[styles.identity, { minWidth: minIdentityWidth }]}>
        <Text numberOfLines={1} style={styles.name}>
          {profile.name}
        </Text>
        <Text numberOfLines={1} style={[styles.detail, { color: accent }]}>
          {detail}
        </Text>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#201A39',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 13,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 3,
  },
  identity: { flex: 1, minWidth: 0 },
  name: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  detail: { fontSize: 12, fontWeight: '900', letterSpacing: 0.7, marginTop: 5 },
});

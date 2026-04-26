import { View, Text } from "@react-pdf/renderer";
import { styles } from "../pdf-styles";
import type { OrgSnapshotData } from "../assemble-org-snapshot";

export function MissionAnchorSection({ data }: { data: OrgSnapshotData }) {
  if (!data.foundation) return null;
  const { mission, vision, coreValues } = data.foundation;
  if (!mission && !vision && coreValues.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.h2}>How this connects to the organization</Text>
      {mission && (
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Mission. </Text>
          {mission}
        </Text>
      )}
      {vision && (
        <Text style={[styles.paragraph, { marginTop: 4 }]}>
          <Text style={styles.bold}>Vision. </Text>
          {vision}
        </Text>
      )}
      {coreValues.length > 0 && (
        <Text style={[styles.paragraph, { marginTop: 4 }]}>
          <Text style={styles.bold}>Core values. </Text>
          {coreValues.join(", ")}
        </Text>
      )}
    </View>
  );
}

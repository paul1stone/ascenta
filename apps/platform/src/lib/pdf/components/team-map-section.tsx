import { View, Text } from "@react-pdf/renderer";
import { styles } from "../pdf-styles";
import type { OrgSnapshotData } from "../assemble-org-snapshot";

export function TeamMapSection({ data }: { data: OrgSnapshotData }) {
  if (!data.team.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.h2}>Your team in {data.employee.department}</Text>
      {data.team.map((m) => (
        <Text
          key={m.id}
          style={[styles.bullet, m.isSelf ? styles.bold : {}]}
        >
          • {m.name} — {m.jobTitle}
          {m.isSelf ? " (you)" : ""}
        </Text>
      ))}
    </View>
  );
}

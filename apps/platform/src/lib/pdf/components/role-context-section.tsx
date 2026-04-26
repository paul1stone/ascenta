import { View, Text } from "@react-pdf/renderer";
import { styles } from "../pdf-styles";
import type { OrgSnapshotData } from "../assemble-org-snapshot";

export function RoleContextSection({ data }: { data: OrgSnapshotData }) {
  const jd = data.jobDescription;
  if (!jd) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.h2}>Your role in context</Text>
      <Text style={styles.paragraph}>{jd.roleSummary}</Text>
      {jd.coreResponsibilities.length > 0 && (
        <View style={{ marginTop: 6 }}>
          <Text style={[styles.paragraph, styles.bold]}>
            Core responsibilities
          </Text>
          {jd.coreResponsibilities.slice(0, 5).map((r, i) => (
            <Text key={i} style={styles.bullet}>
              • {r}
            </Text>
          ))}
        </View>
      )}
      {jd.competencies.length > 0 && (
        <View style={{ marginTop: 6 }}>
          <Text style={[styles.paragraph, styles.bold]}>Competencies</Text>
          <Text style={styles.paragraph}>{jd.competencies.join(", ")}</Text>
        </View>
      )}
    </View>
  );
}

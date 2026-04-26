import { View, Text, Image } from "@react-pdf/renderer";
import { styles } from "../pdf-styles";
import type { OrgSnapshotData } from "../assemble-org-snapshot";

export function CoverSection({ data }: { data: OrgSnapshotData }) {
  const { employee, generatedAt } = data;
  return (
    <View>
      <View style={styles.accentBar} />
      <View style={styles.coverRow}>
        {employee.photoBase64 ? (
          <Image src={employee.photoBase64} style={styles.photo} />
        ) : null}
        <View>
          <Text style={styles.h1}>
            {employee.name}
            {employee.pronouns ? ` · ${employee.pronouns}` : ""}
          </Text>
          <Text style={styles.paragraph}>
            {employee.jobTitle} · {employee.department}
          </Text>
          <Text style={styles.meta}>
            Generated {generatedAt.toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.divider} />
    </View>
  );
}

import { View, Text } from "@react-pdf/renderer";
import { styles } from "../pdf-styles";
import type { OrgSnapshotData } from "../assemble-org-snapshot";

type Responses = NonNullable<OrgSnapshotData["focusLayer"]>["responses"];

const PROMPT_LABELS: Array<[keyof Responses, string]> = [
  ["uniqueContribution", "What you bring uniquely"],
  ["highImpactArea", "Where you create the most impact"],
  ["signatureResponsibility", "Responsibilities that shape the team"],
  ["workingStyle", "How you prefer to work"],
];

export function FocusLayerSectionPdf({ data }: { data: OrgSnapshotData }) {
  if (!data.focusLayer) return null;
  const responses = data.focusLayer.responses;
  return (
    <View style={styles.section}>
      <Text style={styles.h2}>Your Focus Layer</Text>
      {PROMPT_LABELS.map(([key, label]) => (
        <View key={key} style={{ marginBottom: 6 }}>
          <Text style={[styles.paragraph, styles.bold]}>{label}</Text>
          <Text style={styles.paragraph}>{responses[key]}</Text>
        </View>
      ))}
    </View>
  );
}

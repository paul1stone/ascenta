import { View, Text } from "@react-pdf/renderer";
import { styles } from "../pdf-styles";
import type { OrgSnapshotData } from "../assemble-org-snapshot";

export function ReportingLineSection({ data }: { data: OrgSnapshotData }) {
  const { reportingLine, employee } = data;
  const layers: Array<{ label: string; value: string }> = [];
  if (reportingLine.skipLevelName) {
    layers.push({ label: "Skip-level", value: reportingLine.skipLevelName });
  }
  if (reportingLine.managerName) {
    layers.push({ label: "Manager", value: reportingLine.managerName });
  }
  layers.push({ label: "You", value: employee.name });
  if (reportingLine.directReportNames.length > 0) {
    layers.push({
      label: "Reports",
      value: reportingLine.directReportNames.join(", "),
    });
  }
  return (
    <View style={styles.section}>
      <Text style={styles.h2}>Reporting line</Text>
      {layers.map((row, i) => (
        <View key={i}>
          <Text style={styles.reportLine}>
            <Text style={styles.bold}>{row.label}: </Text>
            {row.value}
          </Text>
          {i < layers.length - 1 && <Text style={styles.arrow}>↓</Text>}
        </View>
      ))}
    </View>
  );
}

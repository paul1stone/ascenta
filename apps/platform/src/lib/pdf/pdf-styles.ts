import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#0c1e3d",
  },
  accentBar: { height: 4, backgroundColor: "#ff6b35", marginBottom: 12 },
  h1: { fontSize: 22, fontWeight: 700, marginBottom: 6 },
  h2: {
    fontSize: 14,
    fontWeight: 700,
    marginTop: 16,
    marginBottom: 4,
    color: "#0c1e3d",
  },
  meta: { fontSize: 9, color: "#64748b" },
  paragraph: { fontSize: 10, lineHeight: 1.4 },
  bold: { fontWeight: 700 },
  bullet: { fontSize: 10, marginLeft: 8, marginBottom: 2 },
  section: { marginTop: 12 },
  reportLine: { fontSize: 11, marginBottom: 2 },
  arrow: { fontSize: 9, color: "#94a3b8", marginLeft: 8, marginBottom: 2 },
  coverRow: { flexDirection: "row", alignItems: "center" },
  photo: { width: 64, height: 64, borderRadius: 32, marginRight: 16 },
  divider: { height: 1, backgroundColor: "#e2e8f0", marginVertical: 10 },
});

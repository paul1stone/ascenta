import { Document, Page, renderToBuffer } from "@react-pdf/renderer";
import { styles } from "./pdf-styles";
import type { OrgSnapshotData } from "./assemble-org-snapshot";
import { CoverSection } from "./components/cover-section";
import { RoleContextSection } from "./components/role-context-section";
import { ReportingLineSection } from "./components/reporting-line-section";
import { TeamMapSection } from "./components/team-map-section";
import { FocusLayerSectionPdf } from "./components/focus-layer-section-pdf";
import { MissionAnchorSection } from "./components/mission-anchor-section";

export async function renderOrgSnapshot(
  data: OrgSnapshotData,
): Promise<Buffer> {
  return renderToBuffer(
    <Document>
      <Page size="LETTER" style={styles.page}>
        <CoverSection data={data} />
        <RoleContextSection data={data} />
        <ReportingLineSection data={data} />
        <TeamMapSection data={data} />
        <FocusLayerSectionPdf data={data} />
        <MissionAnchorSection data={data} />
      </Page>
    </Document>,
  );
}

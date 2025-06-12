import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

import logo from "../../../assets/logo.jpg";

// Custom styles
const styles = StyleSheet.create({
  pageContainer: {
    width: "100%",
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 35,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
  },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionSplit: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionLeft: {
    width: "40%",
  },
  sectionRight: {
    width: "40%",
  },
  metaItem: {
    flexDirection: "row",
    marginBottom: 2,
  },
  metaLabel: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 8,
  },
  metaValue: {
    width: "60%",
    fontSize: 8,
  },
  tableContainer: {
    border: "1pt solid #666666",
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCellSmall: {
    border: "1pt solid #666666",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    padding: 4,
    flex: 0.5,
    fontSize: 8,
  },
  tableCellLarge: {
    border: "1pt solid #666666",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    padding: 4,
    flex: 2.5,
    fontSize: 8,
  },
  tableHeader: {
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  headerBurnerLogo: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    opacity: 0.1,
    zIndex: -1,
  },
});

const PoDocument = ({ session, supplier }) => (
  <Document>
    <Page size="A4" style={styles.pageContainer}>
      <View style={{ width: "100%", marginBottom: 10 }}>
        <Image
          src={logo}
          style={{
            width: "100%",
            height: 90,
            objectFit: "cover",
            border: "1pt solid #000",
          }}
        />
      </View>

      {/* Header with logo and supplier */}
      <View style={styles.header}>
        <View style={styles.sectionRight}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Supplier:</Text>
            <Text style={styles.metaValue}>
              {session.supplierName || "Unknown Supplier"}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Contacts:</Text>
            <Text style={styles.metaValue}>
              {session.supplierContacts || "No Contacts"}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Address:</Text>
            <Text style={styles.metaValue}>
              {session.supplierAddress || "No Address"}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.title}>Goods Received Note (GRN)</Text>

      {/* Meta info */}
      <View style={styles.sectionSplit}>
        <View style={styles.sectionLeft}>
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{session.grnNumber}</Text>
          </View>
        </View>
      </View>

      {/* Items Table */}
      <View style={styles.tableContainer}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCellSmall, styles.tableHeader]}>#</Text>
          <Text style={[styles.tableCellLarge, styles.tableHeader]}>
            Item Name
          </Text>
          <Text style={[styles.tableCellSmall, styles.tableHeader]}>Qty</Text>
          <Text style={[styles.tableCellLarge, styles.tableHeader]}>
            Description
          </Text>
          <Text style={[styles.tableCellLarge, styles.tableHeader]}>
            Obtained Amount
          </Text>
        </View>

        {session.allItems && session.allItems.length > 0 ? (
          session.allItems.map((item, idx) => (
            <View key={item._id} style={styles.tableRow}>
              <Text style={styles.tableCellSmall}>{idx + 1}</Text>
              <Text style={styles.tableCellLarge}>
                {item?.item?.name || "Unknown"}
              </Text>
              <Text style={styles.tableCellSmall}>
                {item?.requiredQuantity || 0}
              </Text>
              <Text style={styles.tableCellLarge}>
                {item?.description || "No description"}
              </Text>
              <Text style={styles.tableCellLarge}> </Text>
            </View>
          ))
        ) : (
          <View style={styles.tableRow}>
            <Text style={styles.tableCellLarge}>
              No items found in this session.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.sectionSplit}>
        .........................................................
      </View>

      <View style={styles.sectionSplit}>
        .........................................................
      </View>

      {/* athorization details */}

      <View style={styles.sectionSplit}>
        <View style={styles.sectionRight}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Created At:</Text>
            <Text style={styles.metaValue}>
              {new Date(session.createdAt).toLocaleString()}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Created By:</Text>
            <Text style={styles.metaValue}>
              {session.createdBy
                ? `${session.createdBy.firstName || ""} ${
                    session.createdBy.lastName || ""
                  }`.trim()
                : "Unknown User"}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Comments:</Text>
            <Text style={styles.metaValue}>{session.comments || "None"}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Status Of GRN:</Text>
            <Text style={styles.metaValue}>{session.status || "None"}</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

export default PoDocument;

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { InvoiceWithItems, Profile } from "@/lib/types";

type InvoiceWithClient = InvoiceWithItems & {
  clients: { id: string; name: string; phone: string | null; address: string | null } | null;
};

// Register Noto Sans Bengali for Bangla text support
Font.register({
  family: "NotoSansBengali",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/notosansbengali/NotoSansBengali%5Bwdth%2Cwght%5D.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/notosansbengali/NotoSansBengali%5Bwdth%2Cwght%5D.ttf",
      fontWeight: 700,
    },
  ],
});

Font.register({
  family: "Inter",
  fonts: [
    { src: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf", fontWeight: 600 },
    { src: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf", fontWeight: 700 },
  ],
});

const green = "#00875A";
const greenLight = "#E3F5EE";
const gray50 = "#F9FAFB";
const gray100 = "#F3F4F6";
const gray400 = "#9CA3AF";
const gray600 = "#4B5563";
const gray800 = "#1F2937";
const pink50 = "#FDF2F8";
const pink700 = "#BE185D";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 9,
    color: gray800,
    padding: 40,
    backgroundColor: "#FFFFFF",
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: green,
  },
  brandName: {
    fontFamily: "NotoSansBengali",
    fontSize: 28,
    fontWeight: 700,
    color: green,
  },
  invoiceTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: gray800,
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 10,
    color: gray400,
    textAlign: "right",
    marginTop: 4,
  },
  // Info columns
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  infoCol: {
    width: "48%",
  },
  infoLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: gray400,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoName: {
    fontSize: 12,
    fontWeight: 700,
    color: gray800,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 9,
    color: gray600,
    marginBottom: 1,
  },
  // Date row
  dateRow: {
    flexDirection: "row",
    gap: 30,
    marginBottom: 20,
  },
  dateBlock: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: gray50,
    borderRadius: 6,
  },
  dateLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: gray400,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  dateValue: {
    fontSize: 10,
    fontWeight: 600,
    color: gray800,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Table
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: green,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 2,
  },
  tableHeaderText: {
    fontSize: 7,
    fontWeight: 700,
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: gray100,
  },
  tableRowAlt: {
    backgroundColor: gray50,
  },
  colNum: { width: "6%" },
  colDesc: { width: "44%" },
  colQty: { width: "12%", textAlign: "right" },
  colPrice: { width: "19%", textAlign: "right" },
  colAmount: { width: "19%", textAlign: "right" },
  cellText: {
    fontSize: 9,
    color: gray800,
  },
  cellTextBold: {
    fontSize: 9,
    fontWeight: 600,
    color: gray800,
  },
  cellTextLight: {
    fontSize: 9,
    color: gray600,
  },
  // Totals
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 24,
  },
  totalsBox: {
    width: 220,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  totalLabel: {
    fontSize: 9,
    color: gray400,
  },
  totalValue: {
    fontSize: 9,
    fontWeight: 600,
    color: gray800,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 2,
    borderTopColor: green,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: green,
  },
  grandTotalValue: {
    fontSize: 13,
    fontWeight: 700,
    color: green,
  },
  // bKash
  bkashContainer: {
    backgroundColor: pink50,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FBCFE8",
  },
  bkashTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: pink700,
    marginBottom: 6,
  },
  bkashLabel: {
    fontSize: 8,
    color: gray400,
    marginBottom: 2,
  },
  bkashNumber: {
    fontSize: 14,
    fontWeight: 700,
    color: gray800,
    letterSpacing: 1,
    marginBottom: 4,
  },
  bkashRef: {
    fontSize: 8,
    color: gray600,
  },
  // Notes
  notesContainer: {
    backgroundColor: gray50,
    borderRadius: 6,
    padding: 14,
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: gray400,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  notesText: {
    fontSize: 9,
    color: gray600,
    lineHeight: 1.5,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: gray100,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 7,
    color: gray400,
  },
});

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusStyle(status: string) {
  switch (status) {
    case "paid":
      return { bg: greenLight, color: green, label: "PAID" };
    case "sent":
      return { bg: "#EFF6FF", color: "#1D4ED8", label: "SENT" };
    case "overdue":
      return { bg: "#FEF2F2", color: "#DC2626", label: "OVERDUE" };
    default:
      return { bg: gray100, color: gray600, label: "DRAFT" };
  }
}

export default function InvoicePDF({
  invoice,
  profile,
}: {
  invoice: InvoiceWithClient;
  profile: Profile;
}) {
  const client = invoice.clients;
  const items = invoice.invoice_items ?? [];
  const statusInfo = getStatusStyle(invoice.status);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>হিসাব</Text>
            {profile.business_name && (
              <Text style={{ fontSize: 11, fontWeight: 600, color: gray800, marginTop: 2 }}>
                {profile.business_name}
              </Text>
            )}
            {profile.phone && (
              <Text style={{ fontSize: 9, color: gray600, marginTop: 1 }}>{profile.phone}</Text>
            )}
            {profile.address && (
              <Text style={{ fontSize: 9, color: gray600, marginTop: 1 }}>{profile.address}</Text>
            )}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusInfo.bg, marginTop: 6, alignSelf: "flex-end" },
              ]}
            >
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>
        </View>

        {/* From / Bill To */}
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Bill To</Text>
            {client ? (
              <>
                <Text style={styles.infoName}>{client.name}</Text>
                {client.phone && <Text style={styles.infoText}>{client.phone}</Text>}
                {client.address && <Text style={styles.infoText}>{client.address}</Text>}
              </>
            ) : (
              <Text style={styles.infoText}>—</Text>
            )}
          </View>
          <View style={styles.infoCol}>
            <View style={styles.dateRow}>
              <View style={styles.dateBlock}>
                <Text style={styles.dateLabel}>Issue Date</Text>
                <Text style={styles.dateValue}>{formatDate(invoice.issue_date)}</Text>
              </View>
              {invoice.due_date && (
                <View style={styles.dateBlock}>
                  <Text style={styles.dateLabel}>Due Date</Text>
                  <Text style={styles.dateValue}>{formatDate(invoice.due_date)}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colNum]}>#</Text>
            <Text style={[styles.tableHeaderText, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Unit Price</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
          </View>
          {items.map((item, i) => (
            <View
              key={item.id}
              style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
            >
              <Text style={[styles.cellTextLight, styles.colNum]}>{i + 1}</Text>
              <Text style={[styles.cellTextBold, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.cellText, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.cellText, styles.colPrice]}>
                ৳{Number(item.unit_price).toLocaleString()}
              </Text>
              <Text style={[styles.cellTextBold, styles.colAmount]}>
                ৳{Number(item.amount).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                ৳{Number(invoice.subtotal).toLocaleString()}
              </Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total (BDT)</Text>
              <Text style={styles.grandTotalValue}>
                ৳{Number(invoice.total).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* bKash Payment Block */}
        {profile.bkash_number && (
          <View style={styles.bkashContainer}>
            <Text style={styles.bkashTitle}>💳 bKash Payment</Text>
            <Text style={styles.bkashLabel}>Send payment to:</Text>
            <Text style={styles.bkashNumber}>{profile.bkash_number}</Text>
            <Text style={styles.bkashRef}>
              Reference: {invoice.invoice_number} | Amount: ৳
              {Number(invoice.total).toLocaleString()}
            </Text>
          </View>
        )}

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {invoice.invoice_number} · Generated by হিসাব
          </Text>
          <Text style={styles.footerText}>
            {profile.business_name ?? ""}
            {profile.phone ? ` · ${profile.phone}` : ""}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

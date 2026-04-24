import { StyleSheet } from '@react-pdf/renderer'

export const COLORS = {
  primary: '#5f8a76',
  primaryLight: '#e8f0ec',
  accent: '#c8754a',
  text: '#1c1c1a',
  muted: '#6b6b68',
  border: '#e4e4e0',
  bg: '#fafaf8',
  white: '#ffffff',
}

export const baseStyles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.white,
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 56,
    fontFamily: 'Helvetica',
    color: COLORS.text,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    borderBottomStyle: 'solid',
  },
  brandName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  docType: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  docDate: {
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    borderBottomStyle: 'solid',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontSize: 9,
    color: COLORS.muted,
    width: 120,
    fontFamily: 'Helvetica-Bold',
  },
  value: {
    fontSize: 9,
    color: COLORS.text,
    flex: 1,
  },
  bodyText: {
    fontSize: 10,
    color: COLORS.text,
    lineHeight: 1.6,
  },
  sessionCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.primary,
    borderLeftStyle: 'solid',
  },
  sessionDate: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  sessionFieldLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  sessionFieldText: {
    fontSize: 9,
    color: COLORS.text,
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 56,
    right: 56,
  },
  footerDivider: {
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    borderTopStyle: 'solid',
    marginBottom: 12,
  },
  signatureBlock: {
    alignItems: 'flex-end',
  },
  signatureName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.text,
  },
  signatureRole: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 2,
  },
  declarationText: {
    fontSize: 11,
    color: COLORS.text,
    lineHeight: 1.8,
    textAlign: 'justify',
  },
})

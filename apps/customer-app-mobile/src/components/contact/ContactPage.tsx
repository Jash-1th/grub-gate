import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { contactCopy, contactFields, contactInfo, socialLinks } from '../../data/contact';
import { theme } from '../../theme';

export function ContactPage() {
  const [reason, setReason] = useState('');

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Hero title={contactCopy.heroTitle} subtitle={contactCopy.heroSubtitle} />
      <View style={styles.body}>
        <ContactForm reason={reason} setReason={setReason} />
        <ContactInfo />
        <FollowUs />
      </View>
    </ScrollView>
  );
}

function Hero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroShade} />
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroSubtitle}>{subtitle}</Text>
    </View>
  );
}

function ContactForm({ reason, setReason }: { reason: string; setReason: (value: string) => void }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{contactCopy.formTitle}</Text>
      <Text style={styles.cardSubtitle}>{contactCopy.formSubtitle}</Text>

      <Field label={contactFields.name.label} placeholder={contactFields.name.placeholder} required />
      <Field label={contactFields.email.label} placeholder={contactFields.email.placeholder} required keyboardType="email-address" />
      <Field label={contactFields.phone.label} placeholder={contactFields.phone.placeholder} keyboardType="phone-pad" />

      <View style={styles.fieldBlock}>
        <Text style={styles.label}>{contactFields.reason.label}</Text>
        <View style={styles.reasonGrid}>
          {contactFields.reason.options.map((option) => {
            const active = reason === option;
            return (
              <Pressable
                key={option}
                onPress={() => setReason(option)}
                style={({ pressed }) => [styles.reasonChip, active && styles.reasonChipActive, pressed && styles.pressed]}
              >
                <Text style={[styles.reasonText, active && styles.reasonTextActive]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Field label={contactFields.message.label} placeholder={contactFields.message.placeholder} required multiline />

      <Pressable style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}>
        <Text style={styles.submitText}>{contactFields.sendButton}</Text>
      </Pressable>
    </View>
  );
}

function Field({
  label,
  placeholder,
  required,
  keyboardType,
  multiline,
}: {
  label: string;
  placeholder: string;
  required?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TextInput
        style={[styles.input, multiline && styles.messageInput]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.gray[400]}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

function ContactInfo() {
  return (
    <View style={styles.infoStack}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{contactCopy.infoTitle}</Text>
        <View style={styles.infoRows}>
          {contactInfo.map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Text style={styles.infoIconText}>{item.marker}</Text>
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{contactCopy.mapTitle}</Text>
        <View style={styles.mapMock}>
          <Text style={styles.mapPin}>M</Text>
        </View>
        <Text style={styles.mapDescription}>{contactCopy.mapDescription}</Text>
      </View>
    </View>
  );
}

function FollowUs() {
  return (
    <View style={styles.card}>
      <Text style={styles.socialTitle}>{contactCopy.socialTitle}</Text>
      <View style={styles.socialGrid}>
        {socialLinks.map((name) => (
          <View key={name} style={styles.socialItem}>
            <View style={styles.socialIcon}>
              <Text style={styles.socialIconText}>{name.charAt(0)}</Text>
            </View>
            <Text style={styles.socialName}>{name}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.socialSubtitle}>{contactCopy.socialSubtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.gray[50] },
  content: { paddingBottom: theme.spacing[6] },
  hero: {
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[5],
    backgroundColor: theme.colors.brand.grubRed,
  },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  heroTitle: {
    color: theme.colors.white,
    fontSize: 40,
    lineHeight: 48,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  heroSubtitle: {
    marginTop: theme.spacing[5],
    color: theme.colors.red[100],
    fontSize: theme.typography.fontSize.xl,
    lineHeight: 30,
    textAlign: 'center',
  },
  body: { padding: theme.spacing[4], gap: theme.spacing[6] },
  card: {
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    padding: theme.spacing[6],
    ...theme.shadow.md,
  },
  cardTitle: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize['2xl'],
    lineHeight: 32,
    fontWeight: theme.typography.fontWeight.bold,
  },
  cardSubtitle: { marginTop: theme.spacing[3], marginBottom: theme.spacing[4], color: theme.colors.gray[600], fontSize: theme.typography.fontSize.base, lineHeight: 24 },
  fieldBlock: { marginTop: theme.spacing[4] },
  label: { color: theme.colors.gray[700], fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium, marginBottom: theme.spacing[2] },
  required: { color: theme.colors.red[500] },
  input: {
    minHeight: 50,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    paddingHorizontal: theme.spacing[4],
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    backgroundColor: theme.colors.white,
  },
  messageInput: { minHeight: 132, paddingTop: theme.spacing[3] },
  reasonGrid: { gap: theme.spacing[2] },
  reasonChip: { minHeight: 42, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.gray[300], alignItems: 'center', justifyContent: 'center', paddingHorizontal: theme.spacing[3] },
  reasonChipActive: { borderColor: theme.colors.brand.grubRed, backgroundColor: theme.colors.red[50] },
  reasonText: { color: theme.colors.gray[700], fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium },
  reasonTextActive: { color: theme.colors.brand.grubRed },
  submitButton: { minHeight: 54, marginTop: theme.spacing[6], borderRadius: theme.radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.brand.grubRed, ...theme.shadow.md },
  submitText: { color: theme.colors.white, fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold },
  infoStack: { gap: theme.spacing[6] },
  infoRows: { gap: theme.spacing[5], marginTop: theme.spacing[5] },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  infoIcon: { width: 48, height: 48, borderRadius: theme.radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.brand.grubRed },
  infoIconText: { color: theme.colors.white, fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.bold },
  infoTextWrap: { flex: 1, marginLeft: theme.spacing[4] },
  infoLabel: { color: theme.colors.gray[900], fontSize: theme.typography.fontSize.base, fontWeight: theme.typography.fontWeight.semibold },
  infoValue: { marginTop: theme.spacing[1], color: theme.colors.gray[600], fontSize: theme.typography.fontSize.base, lineHeight: 23 },
  mapMock: { height: 230, marginTop: theme.spacing[5], borderRadius: theme.radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.gray[100], borderWidth: 1, borderColor: theme.colors.gray[200] },
  mapPin: { width: 54, height: 54, borderRadius: theme.radius.full, textAlign: 'center', textAlignVertical: 'center', color: theme.colors.white, backgroundColor: theme.colors.brand.grubRed, fontSize: theme.typography.fontSize['2xl'], fontWeight: theme.typography.fontWeight.bold, lineHeight: 54 },
  mapDescription: { marginTop: theme.spacing[4], color: theme.colors.gray[600], fontSize: theme.typography.fontSize.sm, lineHeight: 21, textAlign: 'center' },
  socialTitle: { color: theme.colors.brand.grubRed, fontSize: theme.typography.fontSize['2xl'], fontWeight: theme.typography.fontWeight.bold, textAlign: 'center' },
  socialGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[3], justifyContent: 'center', marginTop: theme.spacing[6] },
  socialItem: { width: '45%', alignItems: 'center', borderRadius: theme.radius.xl, borderWidth: 1, borderColor: theme.colors.gray[100], padding: theme.spacing[4] },
  socialIcon: { width: 58, height: 58, borderRadius: theme.radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.brand.grubRed, ...theme.shadow.sm },
  socialIconText: { color: theme.colors.white, fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold },
  socialName: { marginTop: theme.spacing[2], color: theme.colors.gray[700], fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.medium, textAlign: 'center' },
  socialSubtitle: { marginTop: theme.spacing[6], color: theme.colors.gray[600], fontSize: theme.typography.fontSize.sm, lineHeight: 21, textAlign: 'center' },
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
});

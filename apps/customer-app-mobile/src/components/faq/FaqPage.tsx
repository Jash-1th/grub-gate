import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { faqCategories, faqCopy } from '../../data/faq';
import { theme } from '../../theme';

export function FaqPage() {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Hero />
      <View style={styles.body}>
        <View style={styles.intro}>
          <Text style={styles.brandTitle}>{faqCopy.helpTitle}</Text>
          <Text style={styles.introSubtitle}>{faqCopy.helpSubtitle}</Text>
        </View>

        <View style={styles.categoryStack}>
          {faqCategories.map((category) => (
            <View key={category.key} style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <View style={styles.categoryRule} />
              <View style={styles.questionStack}>
                {category.questions.map((item, index) => {
                  const key = `${category.key}-${index}`;
                  const isOpen = openItem === key;
                  return (
                    <AccordionItem
                      key={key}
                      question={item.question}
                      answer={item.answer}
                      isOpen={isOpen}
                      onToggle={() => setOpenItem(isOpen ? null : key)}
                    />
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        <ContactCta />
      </View>
    </ScrollView>
  );
}

function Hero() {
  return (
    <View style={styles.hero}>
      <View style={styles.heroShade} />
      <Text style={styles.heroTitle}>{faqCopy.title}</Text>
      <Text style={styles.heroSubtitle}>{faqCopy.subtitle}</Text>
    </View>
  );
}

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.accordion}>
      <Pressable onPress={onToggle} style={({ pressed }) => [styles.accordionButton, pressed && styles.pressed]}>
        <Text style={styles.question}>{question}</Text>
        <Text style={styles.chevron}>{isOpen ? '⌃' : '⌄'}</Text>
      </Pressable>
      {isOpen ? (
        <View style={styles.answerWrap}>
          <Text style={styles.answer}>{answer}</Text>
        </View>
      ) : null}
    </View>
  );
}

function ContactCta() {
  return (
    <View style={styles.ctaCard}>
      <Text style={styles.ctaTitle}>{faqCopy.contactTitle}</Text>
      <Text style={styles.ctaSubtitle}>{faqCopy.contactSubtitle}</Text>
      <View style={styles.ctaActions}>
        <Pressable
          onPress={() => router.push('/contact')}
          style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
        >
          <Text style={styles.outlineButtonText}>{faqCopy.contactSupport}</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}>
          <Text style={styles.outlineButtonText}>{faqCopy.callUs}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: theme.colors.gray[50] },
  content: { paddingBottom: theme.spacing[6] },
  hero: {
    minHeight: 330,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[5],
    backgroundColor: theme.colors.brand.grubRed,
  },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)' },
  heroTitle: {
    color: theme.colors.white,
    fontSize: 38,
    lineHeight: 46,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  heroSubtitle: {
    marginTop: theme.spacing[5],
    color: theme.colors.gray[100],
    fontSize: theme.typography.fontSize.xl,
    lineHeight: 30,
    textAlign: 'center',
  },
  body: { paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[10] },
  intro: { alignItems: 'center', marginBottom: theme.spacing[8] },
  brandTitle: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize['3xl'],
    lineHeight: 38,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  introSubtitle: {
    marginTop: theme.spacing[4],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.base,
    lineHeight: 25,
    textAlign: 'center',
  },
  categoryStack: { gap: theme.spacing[8] },
  categoryCard: {
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    padding: theme.spacing[5],
    ...theme.shadow.md,
  },
  categoryTitle: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize['2xl'],
    lineHeight: 32,
    fontWeight: theme.typography.fontWeight.bold,
  },
  categoryRule: {
    width: 64,
    height: 4,
    borderRadius: theme.radius.full,
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[5],
    backgroundColor: theme.colors.brand.grubRed,
  },
  questionStack: { gap: theme.spacing[4] },
  accordion: {
    overflow: 'hidden',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    backgroundColor: theme.colors.white,
    ...theme.shadow.sm,
  },
  accordionButton: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },
  question: {
    flex: 1,
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.base,
    lineHeight: 23,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  chevron: {
    width: 30,
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'right',
  },
  answerWrap: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[4],
  },
  answer: {
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.base,
    lineHeight: 25,
  },
  ctaCard: {
    marginTop: theme.spacing[10],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[8],
    alignItems: 'center',
    ...theme.shadow.md,
  },
  ctaTitle: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize['2xl'],
    lineHeight: 32,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  ctaSubtitle: {
    marginTop: theme.spacing[4],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.base,
    lineHeight: 25,
    textAlign: 'center',
  },
  ctaActions: {
    width: '100%',
    gap: theme.spacing[3],
    marginTop: theme.spacing[7],
  },
  outlineButton: {
    minHeight: 54,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.brand.grubRed,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    ...theme.shadow.sm,
  },
  outlineButtonText: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
});

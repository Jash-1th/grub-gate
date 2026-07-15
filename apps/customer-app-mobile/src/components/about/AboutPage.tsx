import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { aboutCopy, aboutSections, aboutValues } from '../../data/about';
import { theme } from '../../theme';

const heroImage = require('../../assets/HeroHome.jpg');
const restaurantImage = require('../../assets/grub-gate-default-restaurant-img.jpg');

export function AboutPage() {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Hero />
      <StorySection />
      <ValuesSection />
    </ScrollView>
  );
}

function Hero() {
  return (
    <View style={styles.hero}>
      <View style={styles.heroLayerOne} />
      <View style={styles.heroLayerTwo} />
      <View style={styles.heroGrain}>
        {Array.from({ length: 18 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.grainDot,
              {
                left: `${(index * 17) % 100}%`,
                top: `${(index * 29) % 100}%`,
                opacity: index % 2 === 0 ? 0.14 : 0.08,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.heroShade} />
      <View style={styles.heroTextWrap}>
        <Text style={styles.heroTitle}>{aboutCopy.heroTitle}</Text>
        <Text style={styles.heroSubtitle}>{aboutCopy.heroSubtitle}</Text>
      </View>
    </View>
  );
}

function StorySection() {
  return (
    <View style={styles.storySection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.brandTitle}>{aboutCopy.storyTitle}</Text>
        <Text style={styles.sectionSubtitle}>{aboutCopy.storySubtitle}</Text>
      </View>

      <View style={styles.storyList}>
        {aboutSections.map((section) => (
          <View key={section.id} style={styles.storyCard}>
            <View style={styles.storyTextBlock}>
              <Text style={styles.storyTitle}>{section.title}</Text>
              <Text style={styles.storyDescription}>{section.description}</Text>
            </View>
            <View style={styles.storyImageWrap}>
              {section.image === 'mission' ? (
                <View style={styles.missionVisual}>
                  <View style={styles.missionCircle}>
                    <Text style={styles.missionHeart}>♥</Text>
                  </View>
                </View>
              ) : (
                <Image
                  source={section.image === 'restaurant' ? restaurantImage : heroImage}
                  style={styles.storyImage}
                  resizeMode="cover"
                />
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function ValuesSection() {
  return (
    <View style={styles.valuesSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.brandTitle}>{aboutCopy.valuesTitle}</Text>
        <Text style={styles.sectionSubtitle}>{aboutCopy.valuesSubtitle}</Text>
      </View>

      <View style={styles.valueGrid}>
        {aboutValues.map((value) => (
          <View key={value.id} style={styles.valueCard}>
            <View style={[styles.valueIcon, { backgroundColor: value.color }]}>
              <Text style={styles.valueIconText}>{value.marker}</Text>
            </View>
            <Text style={styles.valueTitle}>{value.title}</Text>
            <Text style={styles.valueText}>{value.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background.page,
  },
  content: {
    paddingBottom: theme.spacing[6],
  },
  hero: {
    minHeight: 340,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#800020',
  },
  heroLayerOne: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#4a0014',
  },
  heroLayerTwo: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    right: -170,
    top: -90,
    backgroundColor: '#b1122d',
    opacity: 0.78,
  },
  heroGrain: {
    ...StyleSheet.absoluteFillObject,
  },
  grainDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.white,
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  heroTextWrap: {
    paddingHorizontal: theme.spacing[5],
    alignItems: 'center',
  },
  heroTitle: {
    color: theme.colors.white,
    fontSize: 40,
    lineHeight: 48,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  heroSubtitle: {
    marginTop: theme.spacing[5],
    maxWidth: 560,
    color: theme.colors.gray[100],
    fontSize: theme.typography.fontSize.xl,
    lineHeight: 30,
    textAlign: 'center',
  },
  storySection: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[10],
    backgroundColor: theme.colors.white,
  },
  valuesSection: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[10],
    backgroundColor: theme.colors.gray[50],
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing[8],
  },
  brandTitle: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize['3xl'],
    lineHeight: 38,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  sectionSubtitle: {
    marginTop: theme.spacing[4],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.base,
    lineHeight: 25,
    textAlign: 'center',
  },
  storyList: {
    gap: theme.spacing[8],
  },
  storyCard: {
    borderRadius: theme.radius['2xl'],
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
    backgroundColor: theme.colors.white,
    padding: theme.spacing[5],
    ...theme.shadow.md,
  },
  storyTextBlock: {
    alignItems: 'center',
  },
  storyTitle: {
    color: theme.colors.brand.grubRed,
    fontSize: theme.typography.fontSize['2xl'],
    lineHeight: 32,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  storyDescription: {
    marginTop: theme.spacing[4],
    color: theme.colors.gray[700],
    fontSize: theme.typography.fontSize.base,
    lineHeight: 25,
    textAlign: 'center',
  },
  storyImageWrap: {
    height: 210,
    marginTop: theme.spacing[6],
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.gray[50],
    ...theme.shadow.sm,
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  missionVisual: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.gray[50],
  },
  missionCircle: {
    width: 116,
    height: 116,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
    shadowColor: theme.colors.brand.grubRed,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.26,
    shadowRadius: 18,
    elevation: 8,
  },
  missionHeart: {
    color: theme.colors.white,
    fontSize: 52,
    lineHeight: 58,
    fontWeight: theme.typography.fontWeight.bold,
  },
  valueGrid: {
    gap: theme.spacing[5],
  },
  valueCard: {
    borderRadius: theme.radius['2xl'],
    borderWidth: 1,
    borderColor: theme.colors.gray[100],
    backgroundColor: theme.colors.white,
    padding: theme.spacing[6],
    alignItems: 'center',
    ...theme.shadow.md,
  },
  valueIcon: {
    width: 76,
    height: 76,
    borderRadius: theme.radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing[5],
    ...theme.shadow.sm,
  },
  valueIconText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  valueTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  valueText: {
    marginTop: theme.spacing[3],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.base,
    lineHeight: 24,
    textAlign: 'center',
  },
});

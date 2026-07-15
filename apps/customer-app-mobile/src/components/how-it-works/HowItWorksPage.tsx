import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useFlash } from '../../contexts/FlashContext';
import { howItWorksCopy } from '../../data/howItWorks';
import { theme } from '../../theme';

const heroImage = require('../../assets/HowItWorksHero.jpg');
const processImage = require('../../assets/howItWorks/allInOne.png');

export function HowItWorksPage() {
  const { height } = useWindowDimensions();
  const heroHeight = Math.max(620, Math.round(height * 0.84));

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Hero height={heroHeight} />
      <ProcessSteps />
      <GetStartedCta />
    </ScrollView>
  );
}

function Hero({ height }: { height: number }) {
  const handleGetStarted = useProtectedPlanNavigation();

  return (
    <ImageBackground source={heroImage} style={[styles.hero, { minHeight: height }]} resizeMode="cover">
      <View style={styles.heroOverlay} />
      <View style={styles.heroContent}>
        <Text style={styles.heroTitle}>{howItWorksCopy.hero.title}</Text>
        <Text style={styles.heroSubtitle}>{howItWorksCopy.hero.subtitle}</Text>
        <Text style={styles.heroDescription}>{howItWorksCopy.hero.description}</Text>

        <View style={styles.ctaGlow}>
          <Pressable onPress={handleGetStarted} style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]}>
            <Text style={styles.heroButtonText}>{howItWorksCopy.hero.cta}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.scrollCue}>
        <View style={styles.scrollCueTrack}>
          <View style={styles.scrollCueDot} />
        </View>
      </View>
    </ImageBackground>
  );
}

function ProcessSteps() {
  return (
    <View style={styles.stepsSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.brandTitle}>{howItWorksCopy.steps.title}</Text>
        <Text style={styles.sectionSubtitle}>{howItWorksCopy.steps.subtitle}</Text>
      </View>

      <View style={styles.processImageCard}>
        <Image source={processImage} style={styles.processImage} resizeMode="contain" />
      </View>
    </View>
  );
}

function GetStartedCta() {
  const handleGetStarted = useProtectedPlanNavigation();

  return (
    <View style={styles.ctaSection}>
      <View style={styles.ctaCard}>
        <Text style={styles.ctaTitle}>{howItWorksCopy.cta.title}</Text>
        <Text style={styles.ctaSubtitle}>{howItWorksCopy.cta.subtitle}</Text>
        <Pressable onPress={handleGetStarted} style={({ pressed }) => [styles.ctaButton, pressed && styles.pressed]}>
          <Text style={styles.ctaButtonText}>{howItWorksCopy.cta.button}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function useProtectedPlanNavigation() {
  const { isAuthenticated } = useAuth();
  const { showFlash } = useFlash();

  return () => {
    if (!isAuthenticated) {
      showFlash('Please sign in to start your meal plan.', 'info');
      router.push('/login');
      return;
    }

    router.push('/plan');
  };
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
    width: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: theme.colors.gray[100],
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
  heroContent: {
    width: '100%',
    maxWidth: 620,
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[10],
  },
  heroTitle: {
    color: theme.colors.white,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'left',
  },
  heroSubtitle: {
    marginTop: theme.spacing[1],
    color: '#fca5a5',
    fontSize: 38,
    lineHeight: 44,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'left',
  },
  heroDescription: {
    marginTop: theme.spacing[6],
    color: theme.colors.gray[100],
    fontSize: theme.typography.fontSize.lg,
    lineHeight: 28,
    textAlign: 'left',
  },
  ctaGlow: {
    marginTop: theme.spacing[8],
    width: '100%',
    maxWidth: 360,
    borderRadius: theme.radius['2xl'],
    padding: 3,
    backgroundColor: 'rgba(128, 0, 32, 0.45)',
    shadowColor: theme.colors.brand.grubRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 12,
  },
  heroButton: {
    minHeight: 58,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
  },
  heroButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  scrollCue: {
    position: 'absolute',
    bottom: theme.spacing[8],
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scrollCueTrack: {
    width: 24,
    height: 40,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.colors.white,
    alignItems: 'center',
    paddingTop: theme.spacing[2],
  },
  scrollCueDot: {
    width: 4,
    height: 12,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.white,
  },
  stepsSection: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[10],
    backgroundColor: theme.colors.white,
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
  processImageCard: {
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    overflow: 'hidden',
  },
  processImage: {
    width: '100%',
    height: 620,
  },
  ctaSection: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[8],
    backgroundColor: theme.colors.gray[50],
  },
  ctaCard: {
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[8],
    alignItems: 'center',
    ...theme.shadow.md,
  },
  ctaTitle: {
    color: theme.colors.gray[900],
    fontSize: theme.typography.fontSize['3xl'],
    lineHeight: 38,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  ctaSubtitle: {
    marginTop: theme.spacing[4],
    color: theme.colors.gray[600],
    fontSize: theme.typography.fontSize.lg,
    lineHeight: 28,
    textAlign: 'center',
  },
  ctaButton: {
    width: '100%',
    minHeight: 56,
    marginTop: theme.spacing[7],
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.grubRed,
    ...theme.shadow.md,
  },
  ctaButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
});

import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradientColors: [string, string];
  onPress: () => void;
}

function ToolCard({
  title,
  description,
  icon,
  gradientColors,
  onPress,
}: ToolCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.toolCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconContainer}
      >
        {icon}
      </LinearGradient>
      <View style={styles.toolCardContent}>
        <Text style={[styles.toolCardTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text
          style={[styles.toolCardDescription, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.tabIconDefault} />
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const tools = [
    {
      title: "Optymalizacja CV",
      description: "Dostosuj CV do konkretnej oferty pracy z pomocą AI",
      icon: <Ionicons name="document-text" size={24} color="#FFFFFF" />,
      gradientColors: ["#0EA5E9", "#0284C7"] as [string, string],
      route: "/optimize" as const,
    },
    {
      title: "Audyt CV (ATS)",
      description: "Oceń swoje CV pod kątem systemów ATS i otrzymaj wskazówki",
      icon: <MaterialCommunityIcons name="file-search" size={24} color="#FFFFFF" />,
      gradientColors: ["#8B5CF6", "#7C3AED"] as [string, string],
      route: "/audit" as const,
    },
    {
      title: "List Motywacyjny",
      description: "Wygeneruj spersonalizowany list motywacyjny",
      icon: <Ionicons name="mail" size={24} color="#FFFFFF" />,
      gradientColors: ["#06D6A0", "#059669"] as [string, string],
      route: "/cover-letter" as const,
    },
    {
      title: "Symulator Rozmowy",
      description:
        "Przygotuj się na rozmowę kwalifikacyjną z pytaniami i odpowiedziami",
      icon: <Feather name="mic" size={24} color="#FFFFFF" />,
      gradientColors: ["#F59E0B", "#D97706"] as [string, string],
      route: "/interview" as const,
    },
    {
      title: "Analiza Kompetencji",
      description: "Sprawdź, jakich umiejętności brakuje Ci do wymarzonej pracy",
      icon: <MaterialCommunityIcons name="chart-bar" size={24} color="#FFFFFF" />,
      gradientColors: ["#EF4444", "#DC2626"] as [string, string],
      route: "/skills-gap" as const,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + webTopInset + 16,
            paddingBottom: insets.bottom + webBottomInset + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBadge}
          >
            <Ionicons name="sparkles" size={14} color="#FFFFFF" />
            <Text style={styles.heroBadgeText}>AI-Powered</Text>
          </LinearGradient>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Twój asystent{"\n"}kariery
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Wykorzystaj AI, aby wyróżnić się w procesie rekrutacji
          </Text>
        </View>

        <View style={styles.toolsSection}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            NARZĘDZIA
          </Text>
          {tools.map((tool, index) => (
            <ToolCard
              key={index}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              gradientColors={tool.gradientColors}
              onPress={() => router.push(tool.route)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  heroSection: {
    marginBottom: 32,
    paddingTop: 8,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  heroBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  heroTitle: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    lineHeight: 42,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
  toolsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  toolCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  toolCardContent: {
    flex: 1,
  },
  toolCardTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 3,
  },
  toolCardDescription: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});

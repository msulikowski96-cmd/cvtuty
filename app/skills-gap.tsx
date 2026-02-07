import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { ScreenHeader } from "@/components/ScreenHeader";
import { InputSection } from "@/components/InputSection";
import { ActionButton } from "@/components/ActionButton";
import { useStreamingRequest } from "@/lib/useStreamingRequest";

interface MatchedSkill {
  skill: string;
  level: string;
  evidence: string;
}

interface MissingSkill {
  skill: string;
  importance: string;
  recommendation: string;
}

interface Recommendation {
  action: string;
  timeframe: string;
  resources: string[];
}

interface SkillsResult {
  matchScore: number;
  summary: string;
  matchedSkills: MatchedSkill[];
  missingSkills: MissingSkill[];
  recommendations: Recommendation[];
}

function SkillBar({
  label,
  level,
  color,
}: {
  label: string;
  level: string;
  color: string;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const getWidth = (l: string) => {
    switch (l) {
      case "strong":
        return "100%";
      case "moderate":
        return "65%";
      case "basic":
        return "35%";
      default:
        return "50%";
    }
  };

  const getLevelLabel = (l: string) => {
    switch (l) {
      case "strong":
        return "Zaawansowany";
      case "moderate":
        return "Średni";
      case "basic":
        return "Podstawowy";
      default:
        return l;
    }
  };

  return (
    <View style={styles.skillBarContainer}>
      <View style={styles.skillBarHeader}>
        <Text style={[styles.skillBarLabel, { color: colors.text }]}>
          {label}
        </Text>
        <Text style={[styles.skillBarLevel, { color: colors.textSecondary }]}>
          {getLevelLabel(level)}
        </Text>
      </View>
      <View
        style={[styles.skillBarTrack, { backgroundColor: colors.border }]}
      >
        <View
          style={[
            styles.skillBarFill,
            { width: getWidth(level), backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

export default function SkillsGapScreen() {
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const { isLoading, result, error, execute, reset } = useStreamingRequest({
    endpoint: "/api/skills/analyze",
  });

  const parsedResult = useMemo((): SkillsResult | null => {
    if (!result) return null;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      return null;
    }
    return null;
  }, [result]);

  const handleAnalyze = () => {
    execute({ cvText, jobDescription });
  };

  const handleReset = () => {
    setCvText("");
    setJobDescription("");
    reset();
  };

  const getImportanceColor = (imp: string) => {
    switch (imp) {
      case "critical":
        return colors.error;
      case "important":
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getImportanceLabel = (imp: string) => {
    switch (imp) {
      case "critical":
        return "Krytyczne";
      case "important":
        return "Ważne";
      default:
        return "Mile widziane";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Analiza Kompetencji"
        subtitle="Porównaj umiejętności z wymaganiami"
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + webBottomInset + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!result && !isLoading && (
            <>
              <InputSection
                label="Twoje CV"
                placeholder="Wklej treść swojego CV..."
                value={cvText}
                onChangeText={setCvText}
                minHeight={160}
              />
              <InputSection
                label="Opis stanowiska"
                placeholder="Wklej opis stanowiska..."
                value={jobDescription}
                onChangeText={setJobDescription}
                minHeight={140}
              />
              <ActionButton
                label="Analizuj kompetencje"
                onPress={handleAnalyze}
                isLoading={isLoading}
                disabled={!cvText.trim() || !jobDescription.trim()}
              />
            </>
          )}

          {isLoading && !parsedResult && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.tint} />
              <Text
                style={[styles.loadingText, { color: colors.textSecondary }]}
              >
                Analizuję kompetencje...
              </Text>
            </View>
          )}

          {parsedResult && (
            <View style={styles.resultSection}>
              <View style={styles.matchScoreSection}>
                <View
                  style={[
                    styles.matchScoreCircle,
                    {
                      borderColor:
                        parsedResult.matchScore >= 70
                          ? colors.success
                          : parsedResult.matchScore >= 40
                            ? colors.warning
                            : colors.error,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.matchScoreValue,
                      {
                        color:
                          parsedResult.matchScore >= 70
                            ? colors.success
                            : parsedResult.matchScore >= 40
                              ? colors.warning
                              : colors.error,
                      },
                    ]}
                  >
                    {parsedResult.matchScore}%
                  </Text>
                  <Text
                    style={[
                      styles.matchScoreLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Dopasowanie
                  </Text>
                </View>
                <Text
                  style={[
                    styles.summaryText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {parsedResult.summary}
                </Text>
              </View>

              {parsedResult.matchedSkills.length > 0 && (
                <View
                  style={[
                    styles.sectionCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.sectionHeader}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.success}
                    />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Posiadane umiejętności
                    </Text>
                  </View>
                  {parsedResult.matchedSkills.map((skill, idx) => (
                    <SkillBar
                      key={idx}
                      label={skill.skill}
                      level={skill.level}
                      color={colors.success}
                    />
                  ))}
                </View>
              )}

              {parsedResult.missingSkills.length > 0 && (
                <View
                  style={[
                    styles.sectionCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.sectionHeader}>
                    <Ionicons
                      name="alert-circle"
                      size={20}
                      color={colors.error}
                    />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Brakujące umiejętności
                    </Text>
                  </View>
                  {parsedResult.missingSkills.map((skill, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.missingSkillCard,
                        { backgroundColor: colors.background },
                      ]}
                    >
                      <View style={styles.missingSkillHeader}>
                        <Text
                          style={[
                            styles.missingSkillName,
                            { color: colors.text },
                          ]}
                        >
                          {skill.skill}
                        </Text>
                        <View
                          style={[
                            styles.importanceBadge,
                            {
                              backgroundColor:
                                getImportanceColor(skill.importance) + "15",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.importanceBadgeText,
                              {
                                color: getImportanceColor(skill.importance),
                              },
                            ]}
                          >
                            {getImportanceLabel(skill.importance)}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.recommendationText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {skill.recommendation}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {parsedResult.recommendations.length > 0 && (
                <View
                  style={[
                    styles.sectionCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.sectionHeader}>
                    <MaterialCommunityIcons
                      name="lightbulb-on"
                      size={20}
                      color={colors.warning}
                    />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Plan działania
                    </Text>
                  </View>
                  {parsedResult.recommendations.map((rec, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.recCard,
                        { backgroundColor: colors.background },
                      ]}
                    >
                      <View style={styles.recHeader}>
                        <View
                          style={[
                            styles.recNumber,
                            { backgroundColor: colors.tint + "15" },
                          ]}
                        >
                          <Text
                            style={[
                              styles.recNumberText,
                              { color: colors.tint },
                            ]}
                          >
                            {idx + 1}
                          </Text>
                        </View>
                        <View style={styles.recContent}>
                          <Text
                            style={[styles.recAction, { color: colors.text }]}
                          >
                            {rec.action}
                          </Text>
                          <Text
                            style={[
                              styles.recTimeframe,
                              { color: colors.textSecondary },
                            ]}
                          >
                            Czas: {rec.timeframe}
                          </Text>
                        </View>
                      </View>
                      {rec.resources && rec.resources.length > 0 && (
                        <View style={styles.resourcesList}>
                          {rec.resources.map((r, rIdx) => (
                            <Text
                              key={rIdx}
                              style={[
                                styles.resourceText,
                                { color: colors.tint },
                              ]}
                            >
                              {r}
                            </Text>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}

              <ActionButton
                label="Nowa analiza"
                onPress={handleReset}
                variant="secondary"
              />
            </View>
          )}

          {error && (
            <View style={styles.errorSection}>
              <ActionButton
                label="Spróbuj ponownie"
                onPress={handleAnalyze}
                variant="secondary"
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { padding: 20 },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  resultSection: { gap: 16 },
  matchScoreSection: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 12,
  },
  matchScoreCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  matchScoreValue: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },
  matchScoreLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  summaryText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  skillBarContainer: {
    gap: 6,
  },
  skillBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skillBarLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  skillBarLevel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  skillBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  skillBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  missingSkillCard: {
    padding: 12,
    borderRadius: 10,
    gap: 6,
  },
  missingSkillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  missingSkillName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  importanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  importanceBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  recommendationText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
  },
  recCard: {
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  recHeader: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  recNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  recNumberText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  recContent: {
    flex: 1,
    gap: 2,
  },
  recAction: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    lineHeight: 20,
  },
  recTimeframe: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  resourcesList: {
    paddingLeft: 38,
    gap: 4,
  },
  resourceText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  errorSection: { marginTop: 12 },
});

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

interface AuditCategory {
  name: string;
  score: number;
  icon: string;
  findings: string[];
}

interface AuditResult {
  score: number;
  summary: string;
  categories: AuditCategory[];
  strengths: string[];
  improvements: string[];
  atsIssues: string[];
}

function ScoreCircle({ score, size = 100 }: { score: number; size?: number }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const getScoreColor = (s: number) => {
    if (s >= 80) return colors.success;
    if (s >= 60) return colors.warning;
    return colors.error;
  };

  return (
    <View
      style={[
        styles.scoreCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: getScoreColor(score),
          backgroundColor: getScoreColor(score) + "15",
        },
      ]}
    >
      <Text
        style={[
          styles.scoreNumber,
          { color: getScoreColor(score), fontSize: size * 0.35 },
        ]}
      >
        {score}
      </Text>
      <Text
        style={[
          styles.scoreLabel,
          { color: colors.textSecondary, fontSize: size * 0.12 },
        ]}
      >
        /100
      </Text>
    </View>
  );
}

function CategoryItem({ category }: { category: AuditCategory }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const getIconName = (icon: string) => {
    switch (icon) {
      case "format":
        return "document-text-outline" as const;
      case "content":
        return "create-outline" as const;
      case "keywords":
        return "key-outline" as const;
      case "impact":
        return "trending-up-outline" as const;
      case "readability":
        return "eye-outline" as const;
      default:
        return "checkmark-circle-outline" as const;
    }
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return colors.success;
    if (s >= 60) return colors.warning;
    return colors.error;
  };

  return (
    <View
      style={[
        styles.categoryCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.categoryHeader}>
        <View style={styles.categoryLeft}>
          <Ionicons
            name={getIconName(category.icon)}
            size={20}
            color={colors.tint}
          />
          <Text style={[styles.categoryName, { color: colors.text }]}>
            {category.name}
          </Text>
        </View>
        <View
          style={[
            styles.categoryScore,
            { backgroundColor: getScoreColor(category.score) + "20" },
          ]}
        >
          <Text
            style={[
              styles.categoryScoreText,
              { color: getScoreColor(category.score) },
            ]}
          >
            {category.score}
          </Text>
        </View>
      </View>
      {category.findings.map((finding, idx) => (
        <View key={idx} style={styles.findingRow}>
          <View
            style={[styles.findingDot, { backgroundColor: colors.tint }]}
          />
          <Text style={[styles.findingText, { color: colors.textSecondary }]}>
            {finding}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function AuditScreen() {
  const [cvText, setCvText] = useState("");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const { isLoading, result, error, execute, reset } = useStreamingRequest({
    endpoint: "/api/cv/audit",
  });

  const parsedResult = useMemo((): AuditResult | null => {
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

  const handleAudit = () => {
    execute({ cvText });
  };

  const handleReset = () => {
    setCvText("");
    reset();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Audyt CV" subtitle="Analiza ATS i rekomendacje" />
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
                placeholder="Wklej treść swojego CV do analizy..."
                value={cvText}
                onChangeText={setCvText}
                minHeight={200}
              />
              <ActionButton
                label="Analizuj CV"
                onPress={handleAudit}
                isLoading={isLoading}
                disabled={!cvText.trim()}
              />
            </>
          )}

          {isLoading && !parsedResult && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.tint} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Analizuję Twoje CV...
              </Text>
            </View>
          )}

          {parsedResult && (
            <View style={styles.resultSection}>
              <View style={styles.scoreSection}>
                <ScoreCircle score={parsedResult.score} />
                <Text
                  style={[
                    styles.summaryText,
                    { color: colors.textSecondary },
                  ]}
                >
                  {parsedResult.summary}
                </Text>
              </View>

              {parsedResult.categories.map((cat, idx) => (
                <CategoryItem key={idx} category={cat} />
              ))}

              {parsedResult.strengths.length > 0 && (
                <View
                  style={[
                    styles.listCard,
                    {
                      backgroundColor: colors.success + "10",
                      borderColor: colors.success + "30",
                    },
                  ]}
                >
                  <View style={styles.listCardHeader}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.success}
                    />
                    <Text
                      style={[styles.listCardTitle, { color: colors.success }]}
                    >
                      Mocne strony
                    </Text>
                  </View>
                  {parsedResult.strengths.map((s, idx) => (
                    <Text
                      key={idx}
                      style={[styles.listItem, { color: colors.text }]}
                    >
                      {s}
                    </Text>
                  ))}
                </View>
              )}

              {parsedResult.improvements.length > 0 && (
                <View
                  style={[
                    styles.listCard,
                    {
                      backgroundColor: colors.warning + "10",
                      borderColor: colors.warning + "30",
                    },
                  ]}
                >
                  <View style={styles.listCardHeader}>
                    <Ionicons
                      name="alert-circle"
                      size={20}
                      color={colors.warning}
                    />
                    <Text
                      style={[styles.listCardTitle, { color: colors.warning }]}
                    >
                      Do poprawy
                    </Text>
                  </View>
                  {parsedResult.improvements.map((s, idx) => (
                    <Text
                      key={idx}
                      style={[styles.listItem, { color: colors.text }]}
                    >
                      {s}
                    </Text>
                  ))}
                </View>
              )}

              {parsedResult.atsIssues.length > 0 && (
                <View
                  style={[
                    styles.listCard,
                    {
                      backgroundColor: colors.error + "10",
                      borderColor: colors.error + "30",
                    },
                  ]}
                >
                  <View style={styles.listCardHeader}>
                    <MaterialCommunityIcons
                      name="robot-confused"
                      size={20}
                      color={colors.error}
                    />
                    <Text
                      style={[styles.listCardTitle, { color: colors.error }]}
                    >
                      Problemy ATS
                    </Text>
                  </View>
                  {parsedResult.atsIssues.map((s, idx) => (
                    <Text
                      key={idx}
                      style={[styles.listItem, { color: colors.text }]}
                    >
                      {s}
                    </Text>
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
                onPress={handleAudit}
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
  scoreSection: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 12,
  },
  scoreCircle: {
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumber: {
    fontFamily: "Inter_700Bold",
  },
  scoreLabel: {
    fontFamily: "Inter_400Regular",
  },
  summaryText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  categoryCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  categoryScore: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryScoreText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  findingRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    paddingLeft: 4,
  },
  findingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  findingText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 20,
  },
  listCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  listCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  listCardTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  listItem: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    paddingLeft: 28,
  },
  errorSection: {
    marginTop: 12,
  },
});

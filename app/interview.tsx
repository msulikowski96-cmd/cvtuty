import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  useColorScheme,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { ScreenHeader } from "@/components/ScreenHeader";
import { InputSection } from "@/components/InputSection";
import { ActionButton } from "@/components/ActionButton";
import { useStreamingRequest } from "@/lib/useStreamingRequest";

interface InterviewQuestion {
  question: string;
  category: string;
  difficulty: string;
  suggestedAnswer: string;
  tips: string[];
}

function QuestionCard({
  q,
  index,
}: {
  q: InterviewQuestion;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "behavioral":
        return colors.accentSecondary;
      case "technical":
        return colors.tint;
      case "situational":
        return colors.warning;
      default:
        return colors.accent;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "behavioral":
        return "Behawioralne";
      case "technical":
        return "Techniczne";
      case "situational":
        return "Sytuacyjne";
      default:
        return "Ogólne";
    }
  };

  const getDifficultyLabel = (d: string) => {
    switch (d) {
      case "easy":
        return "Łatwe";
      case "medium":
        return "Średnie";
      case "hard":
        return "Trudne";
      default:
        return d;
    }
  };

  const catColor = getCategoryColor(q.category);

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      style={[
        styles.questionCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.questionHeader}>
        <View
          style={[styles.questionNumber, { backgroundColor: colors.tint + "15" }]}
        >
          <Text style={[styles.questionNumberText, { color: colors.tint }]}>
            {index + 1}
          </Text>
        </View>
        <View style={styles.questionMeta}>
          <View style={[styles.badge, { backgroundColor: catColor + "20" }]}>
            <Text style={[styles.badgeText, { color: catColor }]}>
              {getCategoryLabel(q.category)}
            </Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.textSecondary + "15" },
            ]}
          >
            <Text
              style={[styles.badgeText, { color: colors.textSecondary }]}
            >
              {getDifficultyLabel(q.difficulty)}
            </Text>
          </View>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.tabIconDefault}
        />
      </View>

      <Text style={[styles.questionText, { color: colors.text }]}>
        {q.question}
      </Text>

      {expanded && (
        <View style={[styles.answerSection, { borderTopColor: colors.border }]}>
          <Text
            style={[styles.answerLabel, { color: colors.textSecondary }]}
          >
            Sugerowana odpowiedź:
          </Text>
          <Text style={[styles.answerText, { color: colors.text }]}>
            {q.suggestedAnswer}
          </Text>

          {q.tips && q.tips.length > 0 && (
            <View style={styles.tipsSection}>
              <Text
                style={[styles.tipsLabel, { color: colors.textSecondary }]}
              >
                Wskazówki:
              </Text>
              {q.tips.map((tip, idx) => (
                <View key={idx} style={styles.tipRow}>
                  <Ionicons
                    name="bulb-outline"
                    size={14}
                    color={colors.warning}
                  />
                  <Text
                    style={[styles.tipText, { color: colors.textSecondary }]}
                  >
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

export default function InterviewScreen() {
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const { isLoading, result, error, execute, reset } = useStreamingRequest({
    endpoint: "/api/interview/simulate",
  });

  const parsedResult = useMemo((): InterviewQuestion[] | null => {
    if (!result) return null;
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.questions || [];
      }
    } catch {
      return null;
    }
    return null;
  }, [result]);

  const handleSimulate = () => {
    execute({ cvText, jobDescription });
  };

  const handleReset = () => {
    setCvText("");
    setJobDescription("");
    reset();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Symulator Rozmowy"
        subtitle="Przygotuj się na pytania rekrutacyjne"
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
                label="Generuj pytania"
                onPress={handleSimulate}
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
                Generuję pytania rekrutacyjne...
              </Text>
            </View>
          )}

          {parsedResult && (
            <View style={styles.resultSection}>
              <Text
                style={[styles.resultInfo, { color: colors.textSecondary }]}
              >
                Kliknij pytanie, aby zobaczyć sugerowaną odpowiedź
              </Text>
              {parsedResult.map((q, idx) => (
                <QuestionCard key={idx} q={q} index={idx} />
              ))}
              <ActionButton
                label="Nowa symulacja"
                onPress={handleReset}
                variant="secondary"
              />
            </View>
          )}

          {error && (
            <View style={styles.errorSection}>
              <ActionButton
                label="Spróbuj ponownie"
                onPress={handleSimulate}
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
  resultSection: { gap: 12 },
  resultInfo: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 4,
  },
  questionCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  questionNumberText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  questionMeta: {
    flexDirection: "row",
    gap: 6,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  questionText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    lineHeight: 22,
  },
  answerSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 8,
  },
  answerLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  answerText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  tipsSection: {
    marginTop: 8,
    gap: 6,
  },
  tipsLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  tipRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  tipText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 19,
    flex: 1,
  },
  errorSection: { marginTop: 12 },
});

import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { ScreenHeader } from "@/components/ScreenHeader";
import { InputSection } from "@/components/InputSection";
import { ActionButton } from "@/components/ActionButton";
import { ResultCard } from "@/components/ResultCard";
import { useStreamingRequest } from "@/lib/useStreamingRequest";

export default function CoverLetterScreen() {
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const { isLoading, result, error, execute, reset } = useStreamingRequest({
    endpoint: "/api/cover-letter/generate",
  });

  const handleGenerate = () => {
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
        title="List Motywacyjny"
        subtitle="Spersonalizowany list od AI"
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
                placeholder="Wklej opis stanowiska, na które aplikujesz..."
                value={jobDescription}
                onChangeText={setJobDescription}
                minHeight={140}
              />
              <ActionButton
                label="Generuj list motywacyjny"
                onPress={handleGenerate}
                isLoading={isLoading}
                disabled={!cvText.trim() || !jobDescription.trim()}
              />
            </>
          )}

          {(result || isLoading) && (
            <View style={styles.resultSection}>
              <ResultCard
                title="List motywacyjny"
                content={result}
                isLoading={isLoading}
              />
              {!isLoading && (
                <ActionButton
                  label="Nowy list"
                  onPress={handleReset}
                  variant="secondary"
                />
              )}
            </View>
          )}

          {error && (
            <View style={styles.errorSection}>
              <ActionButton
                label="Spróbuj ponownie"
                onPress={handleGenerate}
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
  resultSection: { gap: 16 },
  errorSection: { marginTop: 12 },
});

import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { ScreenHeader } from "@/components/ScreenHeader";
import { InputSection } from "@/components/InputSection";
import { ActionButton } from "@/components/ActionButton";
import { ResultCard } from "@/components/ResultCard";
import { useStreamingRequest } from "@/lib/useStreamingRequest";
import { getApiUrl } from "@/lib/query-client";

export default function OptimizeScreen() {
  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const { isLoading, result, error, execute, reset } = useStreamingRequest({
    endpoint: "/api/cv/optimize",
  });

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsParsingPdf(true);
        const asset = result.assets[0];
        
        // On web/mobile we need to get the base64
        let base64 = "";
        if (Platform.OS === "web") {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const res = reader.result as string;
              resolve(res.split(",")[1]);
            };
            reader.readAsDataURL(blob);
          });
        } else {
          // For native, we'd use expo-file-system, but for this demo let's assume web/simple fetch works if possible
          // In a real native app, we'd use FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' })
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const res = reader.result as string;
              resolve(res.split(",")[1]);
            };
            reader.readAsDataURL(blob);
          });
        }

        const apiUrl = getApiUrl().replace(/\/$/, "");
        const parseResponse = await fetch(`${apiUrl}/api/pdf/parse`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64 }),
        });

        const data = await parseResponse.json();
        if (data.text) {
          setCvText(data.text);
        }
      }
    } catch (err) {
      console.error("Pick document error:", err);
    } finally {
      setIsParsingPdf(false);
    }
  };

  const handleOptimize = () => {
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
        title="Optymalizacja CV"
        subtitle="Dostosuj CV do oferty pracy"
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
              <View style={styles.inputHeader}>
                <InputSection
                  label="Twoje CV"
                  placeholder="Wklej treść swojego CV..."
                  value={cvText}
                  onChangeText={setCvText}
                  minHeight={160}
                />
                <View style={styles.uploadButtonContainer}>
                  <ActionButton
                    label={isParsingPdf ? "Przetwarzanie..." : "Wgraj PDF"}
                    onPress={handlePickDocument}
                    variant="secondary"
                    disabled={isParsingPdf}
                  />
                </View>
              </View>
              <InputSection
                label="Opis stanowiska"
                placeholder="Wklej opis stanowiska, na które aplikujesz..."
                value={jobDescription}
                onChangeText={setJobDescription}
                minHeight={140}
              />
              <ActionButton
                label="Optymalizuj CV"
                onPress={handleOptimize}
                isLoading={isLoading}
                disabled={!cvText.trim() || !jobDescription.trim()}
              />
            </>
          )}

          {(result || isLoading) && (
            <View style={styles.resultSection}>
              <ResultCard
                title="Zoptymalizowane CV"
                content={result}
                isLoading={isLoading}
              />
              {!isLoading && (
                <View style={styles.buttonRow}>
                  <ActionButton
                    label="Nowa optymalizacja"
                    onPress={handleReset}
                    variant="secondary"
                  />
                </View>
              )}
            </View>
          )}

          {error && (
            <View
              style={[
                styles.errorContainer,
                { backgroundColor: colors.error + "15", borderColor: colors.error },
              ]}
            >
              <ActionButton
                label="Spróbuj ponownie"
                onPress={handleOptimize}
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
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  inputHeader: {
    marginBottom: 8,
  },
  uploadButtonContainer: {
    marginTop: -8,
    marginBottom: 16,
    alignItems: "flex-end",
  },
  resultSection: {
    gap: 16,
  },
  buttonRow: {
    gap: 12,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
});

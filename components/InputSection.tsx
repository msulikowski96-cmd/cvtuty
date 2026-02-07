import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  useColorScheme,
} from "react-native";
import Colors from "@/constants/colors";

interface InputSectionProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  minHeight?: number;
}

export function InputSection({
  label,
  placeholder,
  value,
  onChangeText,
  minHeight = 120,
}: InputSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            color: colors.text,
            borderColor: colors.border,
            minHeight,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.tabIconDefault}
        value={value}
        onChangeText={onChangeText}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
});

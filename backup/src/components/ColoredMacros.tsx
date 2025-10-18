import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ColoredMacrosProps {
  protein: number;
  carbs: number;
  fat: number;
  style?: any;
  textStyle?: any;
  separator?: string;
}

export default function ColoredMacros({
  protein,
  carbs,
  fat,
  style,
  textStyle,
  separator = ' ',
}: ColoredMacrosProps) {
  // Extraer solo las propiedades de estilo que no sean color
  const { color, ...textStyleWithoutColor } = textStyle || {};
  
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.macroText, { color: '#FF6B35' }, textStyleWithoutColor]}>
        P: {Math.round(protein)}g
      </Text>
      <Text style={[styles.macroText, { color: '#2196F3' }, textStyleWithoutColor]}>
        C: {Math.round(carbs)}g
      </Text>
      <Text style={[styles.macroText, { color: '#4CAF50' }, textStyleWithoutColor]}>
        G: {Math.round(fat)}g
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  macroText: {
    fontSize: 9,
    fontWeight: '500',
    marginRight: 4,
  },
});

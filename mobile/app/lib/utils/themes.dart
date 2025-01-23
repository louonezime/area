import 'dart:ui';

import 'package:area/utils/http.dart';
import 'package:flutter/material.dart';

Future<ThemeData> getTheme() async {
  final theme = await storage.read(key: 'theme');
  if (theme == null) {
    final brightness = PlatformDispatcher.instance.platformBrightness;
    await storage.write(
      key: 'theme',
      value: brightness == Brightness.light ? 'light' : 'dark',
    );
    return brightness == Brightness.light ? lightTheme : darkTheme;
  }
  return theme == 'light' ? lightTheme : darkTheme;
}

class ThemeProvider with ChangeNotifier {
  ThemeProvider();
  ThemeProvider._create(ThemeData theme) {
    themeData = theme;
  }

  ThemeData _themeData =
      PlatformDispatcher.instance.platformBrightness == Brightness.light
          ? lightTheme
          : darkTheme;

  ThemeData get themeData => _themeData;

  set themeData(ThemeData themeData) {
    _themeData = themeData;
    notifyListeners();
  }

  static Future<ThemeProvider> create() async {
    return ThemeProvider._create(await getTheme());
  }

  bool isLightTheme() => themeData == lightTheme;

  Future<void> load() async {
    themeData = await getTheme();
  }

  Future<void> toggleTheme() async {
    themeData = themeData == lightTheme ? darkTheme : lightTheme;
    await storage.write(
      key: 'theme',
      value: themeData == lightTheme ? 'light' : 'dark',
    );
  }
}

final lightTheme = ThemeData(
  colorScheme: ColorScheme.fromSeed(
    seedColor: Colors.white,
    surface: const Color(0xFFFFFFFF),
    onSurface: const Color(0xFF404040),
    primary: const Color(0xFF404040),
    secondary: const Color(0xFF606060),
    onSecondary: const Color(0xFFF8F8F8),
    tertiary: const Color(0xFFA0A0A0),
    onTertiary: Colors.black,
    error: Colors.red,
    onError: const Color(0xFFF8F8F8),
    brightness: Brightness.light,
  ),
  textTheme: const TextTheme(
    titleLarge: TextStyle(
      fontSize: 42,
      fontWeight: FontWeight.w800,
    ),
    titleMedium: TextStyle(
      fontSize: 36,
      fontWeight: FontWeight.w800,
    ),
    titleSmall: TextStyle(
      fontSize: 28,
      fontWeight: FontWeight.w800,
    ),
    headlineLarge: TextStyle(
      fontSize: 26,
      fontWeight: FontWeight.bold,
    ),
    headlineMedium: TextStyle(
      fontSize: 24,
      fontWeight: FontWeight.bold,
    ),
    headlineSmall: TextStyle(
      fontSize: 22,
      fontWeight: FontWeight.bold,
    ),
    bodyLarge: TextStyle(
      fontSize: 18,
    ),
    bodyMedium: TextStyle(
      fontSize: 12,
    ),
    bodySmall: TextStyle(
      fontSize: 10,
    ),
    labelLarge: TextStyle(
      fontSize: 8,
    ),
    labelMedium: TextStyle(
      fontSize: 6,
    ),
    labelSmall: TextStyle(
      fontSize: 4,
    ),
  ),
  useMaterial3: true,
  fontFamily: 'AvenirNext',
);

final darkTheme = ThemeData(
  colorScheme: ColorScheme.fromSeed(
    seedColor: Colors.black,
    surface: const Color(0xFF161616),
    onSurface: const Color(0xFFF8F8F8),
    primary: const Color(0xFF404040),
    onPrimary: const Color(0xFFF8F8F8),
    secondary: const Color(0xFF606060),
    onSecondary: const Color(0xFFF8F8F8),
    onTertiary: const Color(0xFFF8F8F8),
    error: Colors.red,
    onError: const Color(0xFFF8F8F8),
    brightness: Brightness.dark,
  ),
  textTheme: lightTheme.textTheme,
  useMaterial3: true,
  fontFamily: 'AvenirNext',
);

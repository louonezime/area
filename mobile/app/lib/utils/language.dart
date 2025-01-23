import 'dart:ui';

import 'package:area/utils/http.dart';
import 'package:flutter/material.dart';

Future<Locale> getLanguage() async {
  final language = await storage.read(key: 'language');
  if (language == null) {
    final locale = PlatformDispatcher.instance.locale;
    await storage.write(
      key: 'language',
      value: locale.countryCode,
    );
    return locale;
  }
  return Locale(language);
}

class LanguageProvider with ChangeNotifier {
  LanguageProvider();
  LanguageProvider._create(Locale val) {
    locale = val;
  }

  Locale _locale = PlatformDispatcher.instance.locale;

  Locale get locale => _locale;

  set locale(Locale locale) {
    _locale = locale;
    notifyListeners();
  }

  static Future<LanguageProvider> create() async {
    return LanguageProvider._create(await getLanguage());
  }

  Future<void> load() async {
    locale = await getLanguage();
  }

  Future<void> changeLanguage(String countryCode) async {
    locale = Locale(countryCode);
    await storage.write(
      key: 'language',
      value: countryCode,
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

extension StringCapitalize on String {
  String capitalize() {
    if (isEmpty) {
      return this;
    }
    if (length == 1) {
      return toUpperCase();
    }
    return substring(0, 1).toUpperCase() + substring(1).toLowerCase();
  }

  String capitalizeOn(Pattern pattern) =>
      split(pattern).map((e) => e.capitalize()).join(pattern.toString());

  String formatAreaName(BuildContext context) => split('-')
      .map((elem) => elem.formatNameTitle())
      .toList()
      .asMap()
      .map((i, area) => MapEntry(
          i,
          i == 0
              ? '${AppLocalizations.of(context)!.areaIf} $area'
              : '${AppLocalizations.of(context)!.areaThen} $area'))
      .values
      .join('\n');

  String formatNameTitle() => capitalizeOn('_').replaceAll('_', ' ');
  String formatName() => replaceAll('_', ' ');
}

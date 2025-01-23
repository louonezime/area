import 'package:area/components/AreaText.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

SnackBar errorSnackBar({
  required BuildContext context,
  required String content,
}) {
  return SnackBar(
    backgroundColor: Color(0xFFFF0000),
    content: Wrap(
      children: [
        AreaText(
          content,
          textAlign: TextAlign.start,
          style: Theme.of(context).textTheme.headlineSmall,
          color: Color(0xFFFFFFFF),
        ),
      ],
    ),
  );
}

SnackBar successSnackBar({
  required BuildContext context,
  required String content,
}) {
  return SnackBar(
    backgroundColor: Color(0xFF00FF00),
    content: Wrap(
      children: [
        AreaText(
          content,
          textAlign: TextAlign.start,
          style: Theme.of(context).textTheme.headlineSmall,
          color: Color(0xFFFFFFFF),
        ),
      ],
    ),
  );
}

void printResult(
  BuildContext context,
  bool res, {
  String? errorMessage,
  String? successMessage,
}) {
  if (res == true) {
    ScaffoldMessenger.of(context).showSnackBar(
      successSnackBar(
        context: context,
        content:
            successMessage ?? AppLocalizations.of(context)!.connectionSuccess,
      ),
    );
  } else {
    ScaffoldMessenger.of(context).showSnackBar(
      errorSnackBar(
        context: context,
        content: errorMessage ?? AppLocalizations.of(context)!.connectionError,
      ),
    );
  }
}

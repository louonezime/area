import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class ReloadButton extends StatelessWidget {
  const ReloadButton({
    super.key,
    required this.loading,
    required this.onPressed,
    this.buttonColor,
    this.iconColor,
  });

  final bool loading;
  final void Function()? onPressed;
  final Color? buttonColor;
  final Color? iconColor;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      style: ButtonStyle(
        backgroundColor: WidgetStatePropertyAll(
          buttonColor ?? Theme.of(context).colorScheme.primary,
        ),
      ),
      onPressed: loading ? () {} : onPressed,
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: loading
            ? SizedBox(
                width: 30,
                height: 30,
                child: CircularProgressIndicator(
                  color: iconColor ?? Theme.of(context).colorScheme.onPrimary,
                  semanticsLabel: AppLocalizations.of(context)!.loading,
                ),
              )
            : Tooltip(
                message: AppLocalizations.of(context)!.load,
                child: Icon(
                  Icons.sync,
                  color: iconColor ?? Theme.of(context).colorScheme.onPrimary,
                  size: 30,
                  semanticLabel: AppLocalizations.of(context)!.load,
                ),
              ),
      ),
    );
  }
}

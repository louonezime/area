import 'package:area/components/AreaText.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class DeleteButton extends StatelessWidget {
  const DeleteButton({
    super.key,
    required this.onPressed,
  });

  final void Function()? onPressed;

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ButtonStyle(
        backgroundColor: WidgetStatePropertyAll(
          Theme.of(context).colorScheme.error,
        ),
        elevation: WidgetStatePropertyAll(4.0),
      ),
      child: AreaText(
        AppLocalizations.of(context)!.delete,
        selectable: false,
        color: Theme.of(context).colorScheme.onError,
        fontWeight: FontWeight.w800,
      ),
    );
  }
}

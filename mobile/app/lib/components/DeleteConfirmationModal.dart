import 'package:area/components/AreaText.dart';
import 'package:area/components/DeleteButton.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';

class DeleteConfirmationModal extends StatelessWidget {
  const DeleteConfirmationModal({
    super.key,
    required this.message,
  });

  final String message;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)),
      backgroundColor: Theme.of(context).colorScheme.primary,
      title: AreaText(
        message,
        style: Theme.of(context).textTheme.titleMedium,
      ),
      actionsAlignment: MainAxisAlignment.spaceEvenly,
      actionsOverflowAlignment: OverflowBarAlignment.center,
      actions: [
        DeleteButton(onPressed: () => context.pop(true)),
        ElevatedButton(
          style: ButtonStyle(
            backgroundColor: WidgetStatePropertyAll(
              Theme.of(context).colorScheme.secondary,
            ),
            side: WidgetStatePropertyAll(
              BorderSide(
                color: Theme.of(context).colorScheme.onPrimary,
                width: 2.0,
              ),
            ),
            elevation: WidgetStatePropertyAll(4.0),
          ),
          onPressed: () => context.pop(false),
          child: AreaText(
            AppLocalizations.of(context)!.cancel,
            selectable: false,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }
}

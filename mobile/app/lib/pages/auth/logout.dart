import 'package:area/utils/http.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';

class LogoutPage extends StatelessWidget {
  const LogoutPage({super.key});

  @override
  Widget build(BuildContext context) {
    Future<void> onInit() async {
      await logout();
      if (context.mounted) {
        context.goNamed('/', extra: true);
      }
    }

    onInit();

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      body: Center(
        child: CircularProgressIndicator(
          color: Theme.of(context).colorScheme.onSurface,
          semanticsLabel: AppLocalizations.of(context)!.loading,
        ),
      ),
    );
  }
}

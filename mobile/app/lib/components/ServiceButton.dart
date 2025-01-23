import 'package:area/components/AreaText.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_svg/flutter_svg.dart';

class ServiceButton extends StatelessWidget {
  const ServiceButton(
    this.service, {
    super.key,
    this.onPressed,
    this.buttonColor,
    this.borderColor,
    this.textColor,
    this.iconColor,
  });

  final String service;
  final void Function()? onPressed;
  final Color? buttonColor;
  final Color? borderColor;
  final Color? textColor;
  final Color? iconColor;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: OutlinedButton(
        style: ButtonStyle(
          side: WidgetStatePropertyAll(
            BorderSide(
                color: borderColor ?? Theme.of(context).colorScheme.primary),
          ),
          backgroundColor: WidgetStatePropertyAll(buttonColor),
          padding: const WidgetStatePropertyAll(EdgeInsets.all(10.0)),
          minimumSize: const WidgetStatePropertyAll(Size.fromHeight(72.0)),
        ),
        onPressed: onPressed,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: SvgPicture.asset(
                'assets/images/${service.toLowerCase()}-logo.svg',
                alignment: Alignment.topCenter,
                height: 36,
                width: 36,
                color: iconColor,
              ),
            ),
            Expanded(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: AreaText(
                    AppLocalizations.of(context)!.continueWithService(
                        service), // 'Continue with $service'
                    style: Theme.of(context).textTheme.headlineSmall,
                    selectable: false,
                    fontWeight: FontWeight.w700,
                    color: textColor,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

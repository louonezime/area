import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';

class AreaLogo extends StatelessWidget {
  const AreaLogo({
    super.key,
    this.color,
    this.onPressed,
    this.clickable = true,
  });

  final Color? color;
  final void Function()? onPressed;
  final bool clickable;

  @override
  Widget build(BuildContext context) {
    final icon = SvgPicture.asset(
      'assets/images/area-logo.svg',
      height: 120,
      width: 120,
      color: color ?? const Color(0xFFFFFFFF),
      semanticsLabel: 'AREA logo',
    );

    if (!clickable) {
      return icon;
    }
    return IconButton(
      onPressed: onPressed ?? () => context.goNamed('/', extra: true),
      icon: icon,
      tooltip: AppLocalizations.of(context)!.home,
    );
  }
}

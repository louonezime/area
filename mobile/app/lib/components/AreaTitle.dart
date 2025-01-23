import 'package:area/components/AreaText.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';

class AreaTitle extends StatelessWidget {
  const AreaTitle({
    super.key,
    required this.title,
    this.style,
    this.color,
  });

  final String title;
  final TextStyle? style;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final double width = 60 -
        (style != null
            ? Theme.of(context).textTheme.titleLarge!.fontSize! -
                style!.fontSize!
            : 0);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            onPressed: () => context.pop(),
            icon: Icon(
              Icons.arrow_circle_left_outlined,
              color: color ?? Theme.of(context).colorScheme.onSurface,
              size: 40,
            ),
            tooltip: AppLocalizations.of(context)!.back,
          ),
          Flexible(
            child: AreaText(
              title,
              style: style ?? Theme.of(context).textTheme.titleLarge,
              color: color ?? Theme.of(context).colorScheme.onSurface,
            ),
          ),
          SizedBox(width: width),
        ],
      ),
    );
  }
}

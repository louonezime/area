import 'package:flutter/material.dart';

class AreaText extends StatelessWidget {
  const AreaText(
    this.data, {
    super.key,
    this.style,
    this.color,
    this.fontWeight,
    this.textAlign = TextAlign.center,
    this.selectable = true,
  });

  final String data;
  final TextStyle? style;
  final Color? color;
  final TextAlign textAlign;
  final FontWeight? fontWeight;
  final bool selectable;

  @override
  Widget build(BuildContext context) {
    final textColor = color ?? Theme.of(context).colorScheme.onPrimary;
    final textStyle = style ?? Theme.of(context).textTheme.bodyLarge;
    return selectable
        ? SelectableText(
            data,
            style: textStyle?.copyWith(
              color: textColor,
              fontWeight: fontWeight,
            ),
            textAlign: textAlign,
          )
        : Text(
            data,
            style: textStyle?.copyWith(
              color: textColor,
              fontWeight: fontWeight,
            ),
            textAlign: textAlign,
          );
  }
}

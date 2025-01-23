import 'package:area/components/AreaText.dart';
import 'package:flutter/material.dart';

class WritableDivider extends StatelessWidget {
  const WritableDivider({
    super.key,
    this.innerMargin = 20.0,
    this.outerMargin = 20.0,
    required this.text,
  });

  final double innerMargin;
  final double outerMargin;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Container(
            margin: EdgeInsets.only(left: outerMargin, right: innerMargin),
            child: Divider(
              color: Theme.of(context).colorScheme.onSurface,
              height: 36,
            ),
          ),
        ),
        AreaText(
          text,
          color: Theme.of(context).colorScheme.onSurface,
        ),
        Expanded(
          child: Container(
            margin: EdgeInsets.only(left: innerMargin, right: outerMargin),
            child: Divider(
              color: Theme.of(context).colorScheme.onSurface,
              height: 36,
            ),
          ),
        ),
      ],
    );
  }
}

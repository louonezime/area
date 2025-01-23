import 'package:area/components/AreaText.dart';
import 'package:area/utils/color.dart';
import 'package:flutter/material.dart';

class ActionCard extends StatelessWidget {
  ActionCard(
    this.data, {
    super.key,
    required this.onTap,
    this.color,
    this.textColor,
    this.style,
    this.sharp = false,
    this.backgroundColorBuilder,
    this.borderColor,
    this.borderWidth = 4.0,
  });

  final String data;
  final void Function() onTap;
  final Color? color;
  final Color? textColor;
  final Color? borderColor;
  final double borderWidth;
  final TextStyle? style;
  final bool sharp;
  final Future<Color?> Function()? backgroundColorBuilder;

  final _scrollController = ScrollController();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: backgroundColorBuilder != null ? backgroundColorBuilder!() : null,
      initialData: color ?? AreaColor.random(),
      builder: (context, snapshot) {
        final backgroundColor = snapshot.data;
        final foregroundColor =
            textColor ?? backgroundColor?.getMatchingColor();

        return Card(
          margin: EdgeInsets.zero,
          color: backgroundColor,
          clipBehavior: Clip.antiAlias,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(
              sharp ? Radius.zero : Radius.circular(12.0),
            ),
            side: borderColor != null
                ? BorderSide(
                    color: borderColor!,
                    width: borderWidth,
                  )
                : BorderSide.none,
          ),
          elevation: 8.0,
          child: InkWell(
            splashColor: Colors.white54,
            onTap: snapshot.connectionState != ConnectionState.done &&
                    backgroundColorBuilder != null
                ? () {}
                : onTap,
            child: snapshot.connectionState != ConnectionState.done &&
                    backgroundColorBuilder != null
                ? Center(
                    child: CircularProgressIndicator(color: foregroundColor),
                  )
                : RawScrollbar(
                    controller: _scrollController,
                    thumbColor: foregroundColor,
                    thumbVisibility: true,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12.0),
                    ),
                    mainAxisMargin: 14.0,
                    crossAxisMargin: 4.0,
                    child: Center(
                      child: ListView(
                        controller: _scrollController,
                        shrinkWrap: true,
                        primary: false,
                        children: [
                          Padding(
                            padding: const EdgeInsets.symmetric(
                                vertical: 5.0, horizontal: 10.0),
                            child: AreaText(
                              data,
                              style: style ??
                                  Theme.of(context).textTheme.titleSmall,
                              selectable: false,
                              fontWeight: FontWeight.w800,
                              color: foregroundColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
          ),
        );
      },
    );
  }
}

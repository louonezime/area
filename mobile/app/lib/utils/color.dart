import 'dart:math' as math;

import 'package:flutter/material.dart';

extension AreaColor on Color {
  Color getMatchingColor() =>
      computeLuminance() < 0.5 ? Colors.white : Colors.black;

  static Color random() =>
      Colors.primaries[math.Random().nextInt(Colors.primaries.length)];
}

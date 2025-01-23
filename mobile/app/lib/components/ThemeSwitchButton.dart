import 'package:flutter/material.dart';

class ThemeSwitchButton extends StatefulWidget {
  const ThemeSwitchButton({
    super.key,
    required this.value,
    required this.onChanged,
    this.tooltip,
  });

  final bool value;
  final void Function(bool) onChanged;
  final String? tooltip;

  @override
  State<ThemeSwitchButton> createState() => _ThemeSwitchButtonState();
}

class _ThemeSwitchButtonState extends State<ThemeSwitchButton> {
  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: widget.tooltip ?? '',
      child: Transform.scale(
        scale: 1.5,
        child: Switch(
          value: widget.value,
          onChanged: widget.onChanged,
          thumbIcon: WidgetStatePropertyAll(
            Icon(
              widget.value ? Icons.light_mode : Icons.dark_mode,
              color: widget.value ? Color(0xFFFFcc00) : Color(0xFF000000),
            ),
          ),
        ),
      ),
    );
  }
}

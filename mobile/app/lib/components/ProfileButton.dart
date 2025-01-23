import 'package:area/components/AreaText.dart';
import 'package:area/utils/http.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';

class ProfileItem {
  const ProfileItem(
    this.title,
    this.page,
    this.color,
  );

  final String title;
  final String page;
  final Color? color;
}

class ProfileDropdown extends StatefulWidget {
  const ProfileDropdown({
    super.key,
    this.iconColor,
    this.menuColor,
    this.textColor,
  });

  final Color? iconColor;
  final Color? menuColor;
  final Color? textColor;

  @override
  State<ProfileDropdown> createState() => _ProfileDropdownState();
}

class _ProfileDropdownState extends State<ProfileDropdown> {
  bool? connected;

  @override
  void initState() {
    super.initState();
    isConnected().then(
      (res) => setState(() {
        connected = res;
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (connected == null) {
      return PopupMenuButton(
        enabled: false,
        color: widget.menuColor,
        tooltip: AppLocalizations.of(context)!.profileInfos,
        icon: Icon(
          Icons.person_outline,
          size: 50,
          semanticLabel: AppLocalizations.of(context)!.profileInfos,
          color: widget.iconColor,
        ),
        itemBuilder: (context) => [],
      );
    }

    final List<ProfileItem> entries = connected!
        ? [
            if (ModalRoute.of(context)!.settings.name != '/profile')
              ProfileItem(AppLocalizations.of(context)!.profile, '/profile',
                  widget.textColor),
            ProfileItem(AppLocalizations.of(context)!.logOut, '/logout',
                Theme.of(context).colorScheme.error),
          ]
        : [
            ProfileItem(AppLocalizations.of(context)!.logIn, '/login',
                widget.textColor),
          ];

    return PopupMenuButton(
      color: widget.menuColor,
      elevation: 5.0,
      tooltip: AppLocalizations.of(context)!.profileInfos,
      icon: Icon(
        Icons.person_outline,
        size: 50,
        semanticLabel: AppLocalizations.of(context)!.profileInfos,
        color: widget.iconColor,
      ),
      itemBuilder: (context) => entries
          .map(
            (entry) => PopupMenuItem(
              child: AreaText(
                entry.title,
                selectable: false,
                color: entry.color,
              ),
              onTap: () => context.pushNamed(entry.page),
            ),
          )
          .toList(),
    );
  }
}

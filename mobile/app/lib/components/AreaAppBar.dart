import 'package:area/components/AreaLogo.dart';
import 'package:area/components/ProfileButton.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class AreaAppBar extends StatelessWidget implements PreferredSizeWidget {
  const AreaAppBar({
    super.key,
    required GlobalKey<ScaffoldState> scaffoldKey,
  }) : _scaffoldKey = scaffoldKey;

  final GlobalKey<ScaffoldState> _scaffoldKey;

  @override
  Widget build(BuildContext context) {
    return AppBar(
      surfaceTintColor: Theme.of(context).colorScheme.surface,
      backgroundColor: Theme.of(context).colorScheme.surface,
      centerTitle: true,
      title: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            tooltip: AppLocalizations.of(context)!.menu, // 'Menu'
            onPressed: () => _scaffoldKey.currentState!.openDrawer(),
            icon: Icon(
              Icons.menu_rounded,
              size: 40,
              color: Theme.of(context).colorScheme.onSurface,
              semanticLabel: AppLocalizations.of(context)!.menu, // 'Menu'
            ),
          ),
          AreaLogo(color: Theme.of(context).colorScheme.onSurface),
          ProfileDropdown(
            menuColor: Theme.of(context).colorScheme.primary,
            iconColor: Theme.of(context).colorScheme.onSurface,
            textColor: Theme.of(context).colorScheme.onPrimary,
          ),
        ],
      ),
      automaticallyImplyLeading: false,
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(AppBar().preferredSize.height);
}

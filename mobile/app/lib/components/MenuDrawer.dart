import 'package:area/components/AreaText.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';

class NavDrawer extends StatefulWidget {
  const NavDrawer({
    super.key,
  });

  @override
  State<NavDrawer> createState() => _NavDrawerState();
}

class _NavDrawerState extends State<NavDrawer> {
  final _scrollController = ScrollController();

  void navToPage(BuildContext context, String page) {
    if (ModalRoute.of(context)!.settings.name != page) {
      context.pushNamed(page);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      shape: const ContinuousRectangleBorder(),
      backgroundColor: Theme.of(context).colorScheme.primary,
      width: 300,
      child: SafeArea(
        child: RawScrollbar(
          controller: _scrollController,
          thumbColor: Theme.of(context).colorScheme.onPrimary,
          thumbVisibility: true,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.0),
          ),
          mainAxisMargin: 14.0,
          crossAxisMargin: 8.0,
          child: ListView(
            controller: _scrollController,
            children: [
              Padding(
                padding: const EdgeInsets.only(
                  left: 24.0,
                  right: 24.0,
                  top: 14.0,
                  bottom: 14.0,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    AreaText(
                      AppLocalizations.of(context)!.menu,
                      style: Theme.of(context).textTheme.titleMedium,
                      fontWeight: FontWeight.w800,
                      textAlign: TextAlign.start,
                    ),
                    CloseButton(
                      color: Theme.of(context).colorScheme.onPrimary,
                      style:
                          ButtonStyle(iconSize: WidgetStatePropertyAll(50.0)),
                    ),
                  ],
                ),
              ),
              MenuDivider(),
              MenuItem(
                AppLocalizations.of(context)!.home,
                onTap: () => navToPage(context, '/'),
              ),
              MenuItem(
                AppLocalizations.of(context)!.create,
                onTap: () => navToPage(context, '/create'),
              ),
              MenuItem(
                AppLocalizations.of(context)!.aboutThisProject,
                onTap: () => navToPage(context, '/about-this-project'),
              ),
              MenuItem(
                AppLocalizations.of(context)!.aboutUs,
                onTap: () => navToPage(context, '/about-us'),
              ),
              MenuDivider(),
              MenuItem(
                AppLocalizations.of(context)!.settings,
                onTap: () => navToPage(context, '/settings'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class MenuItem extends StatelessWidget {
  const MenuItem(
    this.data, {
    super.key,
    required this.onTap,
  });

  final String data;
  final void Function() onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 8.0, bottom: 8.0),
      child: ListTile(
        onTap: onTap,
        title: Padding(
          padding: const EdgeInsets.only(left: 8.0, right: 8.0),
          child: AreaText(
            data,
            selectable: false,
            textAlign: TextAlign.start,
            style: Theme.of(context).textTheme.titleSmall,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}

class MenuDivider extends StatelessWidget {
  const MenuDivider({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(top: 16.0, bottom: 16.0, left: 26.0, right: 26.0),
      child: Divider(
        color: Theme.of(context).colorScheme.onPrimary,
      ),
    );
  }
}

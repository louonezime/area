import 'package:area/components/AreaAppBar.dart';
import 'package:area/components/AreaScaffold.dart';
import 'package:area/components/AreaText.dart';
import 'package:area/components/MenuDrawer.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class AboutThisProjectPage extends StatefulWidget {
  const AboutThisProjectPage({super.key});

  @override
  State<AboutThisProjectPage> createState() => _AboutThisProjectPageState();
}

class _AboutThisProjectPageState extends State<AboutThisProjectPage> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    return AreaScaffold(
      scaffoldKey: _scaffoldKey,
      drawer: const NavDrawer(),
      appBar: AreaAppBar(scaffoldKey: _scaffoldKey),
      child: const MainPage(),
    );
  }
}

class MainPage extends StatelessWidget {
  const MainPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.only(
          top: 50.0,
          bottom: 20.0,
          left: 10.0,
          right: 10.0,
        ),
        child: Column(
          children: [
            AreaText(
              AppLocalizations.of(context)!
                  .aboutThisProject, // 'About This Project'
              style: Theme.of(context).textTheme.titleLarge,
              color: Theme.of(context).colorScheme.onSurface,
            ),
            Padding(
              padding:
                  const EdgeInsets.symmetric(vertical: 60.0, horizontal: 6.0),
              child: Column(
                children: [
                  Card(
                    color: Theme.of(context).colorScheme.primary,
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: AreaText(
                        AppLocalizations.of(context)!.aboutThisProjectMessage,
                        textAlign: TextAlign.start,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

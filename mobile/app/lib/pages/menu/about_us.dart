import 'package:area/components/AreaAppBar.dart';
import 'package:area/components/AreaScaffold.dart';
import 'package:area/components/AreaText.dart';
import 'package:area/components/MenuDrawer.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class AboutUsPage extends StatefulWidget {
  const AboutUsPage({super.key});

  @override
  State<AboutUsPage> createState() => _AboutUsPageState();
}

class _AboutUsPageState extends State<AboutUsPage> {
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
              AppLocalizations.of(context)!.aboutUs, // 'About Us'
              style: Theme.of(context).textTheme.titleLarge,
              color: Theme.of(context).colorScheme.onSurface,
            ),
            Padding(
              padding: const EdgeInsets.only(top: 60.0),
              child: Column(
                children: [
                  Card(
                    color: Theme.of(context).colorScheme.primary,
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        children: [
                          AreaText(
                            AppLocalizations.of(context)!.aboutUsMessage,
                          ),
                          Padding(
                            padding: const EdgeInsets.only(top: 24.0),
                            child: Wrap(
                              alignment: WrapAlignment.spaceBetween,
                              spacing: 24.0,
                              runSpacing: 24.0,
                              children: [
                                TeamImage(
                                  name: 'Lou',
                                  role: 'Scrum Master',
                                ),
                                TeamImage(
                                  name: 'Alexandre',
                                  role: 'Product Owner',
                                ),
                                TeamImage(
                                  name: 'Johana',
                                  role: 'Q&A Specialist',
                                ),
                                TeamImage(
                                  name: 'Adam',
                                  role: 'Q&A Specialist',
                                ),
                              ],
                            ),
                          ),
                        ],
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

class TeamImage extends StatelessWidget {
  const TeamImage({
    super.key,
    required this.name,
    required this.role,
  });

  final String name;
  final String role;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 150,
      height: 200,
      child: Card(
        color: Theme.of(context).colorScheme.secondary,
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image(
                image: Image.asset(
                  'assets/images/team/${name.toLowerCase()}.png',
                ).image,
                width: 70,
                height: 70,
              ),
              SizedBox(height: 20.0),
              AreaText(
                name,
                style: Theme.of(context).textTheme.headlineSmall,
                color: Theme.of(context).colorScheme.onSecondary,
              ),
              AreaText(
                role,
                style: Theme.of(context).textTheme.bodyMedium,
                color: Theme.of(context).colorScheme.onSecondary,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

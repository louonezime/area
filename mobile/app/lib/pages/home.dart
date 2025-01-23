import 'dart:convert';
import 'dart:developer';

import 'package:area/components/ActionCard.dart';
import 'package:area/components/AreaHomeAppBar.dart';
import 'package:area/components/AreaScaffold.dart';
import 'package:area/components/AreaText.dart';
import 'package:area/components/MenuDrawer.dart';
import 'package:area/components/ReloadButton.dart';
import 'package:area/utils/api.dart';
import 'package:area/utils/area.dart';
import 'package:area/utils/http.dart';
import 'package:area/utils/string.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_svg/svg.dart';
import 'package:go_router/go_router.dart';

class HomePage extends StatefulWidget {
  const HomePage({
    super.key,
    required this.title,
  });

  final String title;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    return AreaScaffold(
      scaffoldKey: _scaffoldKey,
      drawer: const NavDrawer(),
      appBar: AreaHomeAppBar(scaffoldKey: _scaffoldKey),
      child: const MainPage(),
    );
  }
}

class MainPage extends StatefulWidget {
  const MainPage({
    super.key,
  });

  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  List<Area> _areas = [];
  List<ActionCard> _recommendations = [];
  bool _loading = false;
  bool _connected = false;

  Future<void> _loadAreas() async {
    setState(() => _loading = true);
    final endpoint = await getAPIEndpointPath('areas');
    if (endpoint == null || !context.mounted) {
      setState(() => _loading = false);
      return;
    }
    try {
      final responseRaw =
          await fetchData(context, endpoint, redirectOnError: false);
      final response = jsonDecode(responseRaw) as List<dynamic>;
      _areas.clear();
      setState(() {
        for (var elem in response) {
          try {
            final area = Area.fromJson(elem);
            _areas.add(area);
          } catch (err) {
            log(
              '_loadAreas: ${err.toString()} ${elem.toString()}',
              time: DateTime.now(),
            );
          }
        }
      });
      final tmp = await setAreaColors(context, _areas);
      setState(() => _areas = tmp);
      return;
    } catch (e) {
      log('_loadAreas: $e', time: DateTime.now());
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  void initState() {
    super.initState();
    isConnected().then(
      (res) {
        setState(() {
          _connected = res;
        });
        if (_connected) {
          _loadAreas();
        }
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    _recommendations = [
      ActionCard(
        AppLocalizations.of(context)!.areaExample1,
        onTap: () => context.goNamed('/create'),
      ),
      ActionCard(
        AppLocalizations.of(context)!.areaExample2,
        onTap: () => context.goNamed('/create'),
      ),
      ActionCard(
        AppLocalizations.of(context)!.areaExample3,
        onTap: () => context.goNamed('/create'),
      ),
    ];

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: <Widget>[
          if (!_connected)
            HomeBackground(
              child: Center(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      ElevatedButton(
                        style: ButtonStyle(
                          backgroundColor: WidgetStatePropertyAll(
                            Theme.of(context).colorScheme.onPrimary,
                          ),
                          elevation: WidgetStatePropertyAll(4.0),
                        ),
                        onPressed: () => context.pushNamed('/login'),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: AreaText(
                            AppLocalizations.of(context)!.startNow,
                            selectable: false,
                            style: Theme.of(context).textTheme.headlineSmall,
                            fontWeight: FontWeight.w800,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          if (_connected)
            Padding(
              padding: const EdgeInsets.only(top: 20.0),
              child: ReloadButton(
                loading: _loading,
                onPressed: _loadAreas,
              ),
            ),
          if (!_connected)
            Padding(
              padding: const EdgeInsets.only(
                left: 20.0,
                right: 20.0,
                bottom: 20.0,
                top: 50.0,
              ),
              child: AreaText(
                'Explore your possibilities with AREA',
                style: Theme.of(context).textTheme.titleMedium,
                color: Theme.of(context).colorScheme.onSurface,
              ),
            ),
          if (!_connected)
            Padding(
              padding:
                  const EdgeInsets.only(left: 20.0, right: 20.0, bottom: 20.0),
              child: GridView.count(
                primary: false,
                mainAxisSpacing: 12.0,
                crossAxisSpacing: 12.0,
                crossAxisCount: MediaQuery.of(context).size.width > 680 ? 4 : 2,
                shrinkWrap: true,
                children: _recommendations,
              ),
            ),
          if (_connected)
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: _areas.isEmpty
                  ? SizedBox(
                      height: MediaQuery.of(context).size.height * 0.5,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          AreaText(
                            AppLocalizations.of(context)!.noAreasYet,
                            style: Theme.of(context).textTheme.titleMedium,
                            color: Theme.of(context).colorScheme.onSurface,
                          ),
                          ElevatedButton(
                            style: ButtonStyle(
                              backgroundColor: WidgetStatePropertyAll(
                                Theme.of(context).colorScheme.secondary,
                              ),
                              elevation: WidgetStatePropertyAll(4.0),
                            ),
                            onPressed: () => context.pushNamed('/create'),
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: AreaText(
                                AppLocalizations.of(context)!.create,
                                selectable: false,
                                style:
                                    Theme.of(context).textTheme.headlineSmall,
                                fontWeight: FontWeight.w800,
                                color:
                                    Theme.of(context).colorScheme.onSecondary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    )
                  : GridView.count(
                      primary: false,
                      mainAxisSpacing: 12.0,
                      crossAxisSpacing: 12.0,
                      crossAxisCount:
                          MediaQuery.of(context).size.width > 680 ? 4 : 2,
                      shrinkWrap: true,
                      children: _areas
                          .asMap()
                          .map(
                            (i, area) => MapEntry(
                              i,
                              ActionCard(
                                'AREA ${i + 1}\n${area.name.formatAreaName(context)}',
                                backgroundColorBuilder: () async =>
                                    getAreaColor(context, area),
                                onTap: () async {
                                  final res = await showDialog(
                                    context: context,
                                    builder: (context) => AreaModal(
                                      area: area,
                                      id: i,
                                    ),
                                  ) as bool?;
                                  if (res != null && res == true) {
                                    setState(() => _areas.removeAt(i));
                                  }
                                },
                                style:
                                    Theme.of(context).textTheme.headlineMedium,
                              ),
                            ),
                          )
                          .values
                          .toList(),
                    ),
            ),
        ],
      ),
    );
  }
}

class HomeBackground extends StatelessWidget {
  const HomeBackground({
    super.key,
    this.child,
  });

  final Widget? child;

  @override
  Widget build(BuildContext context) {
    final List<Widget> children = [
      SvgPicture.asset(
        'assets/images/welcome-bg.svg',
        alignment: Alignment.bottomCenter,
        fit: BoxFit.cover,
      ),
    ];

    if (child != null) {
      children.add(child!);
    }
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary,
      ),
      height: 200,
      child: Stack(children: children),
    );
  }
}

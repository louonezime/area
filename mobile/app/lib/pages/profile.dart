import 'dart:convert';
import 'dart:developer';

import 'package:area/components/ActionCard.dart';
import 'package:area/components/AreaAppBar.dart';
import 'package:area/components/AreaScaffold.dart';
import 'package:area/components/AreaText.dart';
import 'package:area/components/AreaTitle.dart';
import 'package:area/components/MenuDrawer.dart';
import 'package:area/utils/api.dart';
import 'package:area/utils/area.dart';
import 'package:area/utils/http.dart';
import 'package:area/utils/string.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';

class UserInfos {
  const UserInfos({
    required this.id,
    required this.name,
    required this.email,
    this.oauthProvider,
  });

  final int id;
  final String name;
  final String email;
  final dynamic oauthProvider;

  factory UserInfos.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': int id,
        'name': String name,
        'email': String email,
        'oauthProvider': dynamic oauthProvider,
      } =>
        UserInfos(
          id: id,
          name: name,
          email: email,
          oauthProvider: oauthProvider,
        ),
      _ => throw const FormatException('Failed to load user infos'),
    };
  }
}

class ProfilePage extends StatelessWidget {
  ProfilePage({super.key});

  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    return AreaScaffold(
      scaffoldKey: _scaffoldKey,
      appBar: AreaAppBar(scaffoldKey: _scaffoldKey),
      drawer: const NavDrawer(),
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
  bool _loading = false;
  bool _loadingAreas = false;
  bool _loadingServices = false;
  UserInfos? _infos;
  List<Area> _areas = [];
  final List<Service> _services = [];
  final List<Color> _serviceColors = [];

  Future<void> _loadUserInfos() async {
    setState(() => _loading = true);
    final endpoint = await getAPIEndpointPath('user');
    if (endpoint == null || !context.mounted) {
      setState(() => _loading = false);
      return await _loadUserInfos();
    }
    try {
      final responseRaw = await fetchData(context, endpoint);
      final response = UserInfos.fromJson(jsonDecode(responseRaw));
      setState(() {
        _infos = response;
      });
      return;
    } catch (e) {
      log('_loadUserInfos: $e', time: DateTime.now());
    } finally {
      setState(() => _loading = false);
    }
    return await _loadUserInfos();
  }

  Future<void> _loadAreas() async {
    setState(() => _loadingAreas = true);
    final endpoint = await getAPIEndpointPath('areas');
    if (endpoint == null || !context.mounted) {
      setState(() => _loadingAreas = false);
      return await _loadAreas();
    }
    try {
      final responseRaw = await fetchData(context, endpoint);
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
      setState(() => _loadingAreas = false);
    }
    return await _loadAreas();
  }

  Future<void> _loadServices() async {
    setState(() => _loadingServices = true);
    final endpoint = await getAPIEndpointPath('my-services');
    if (endpoint == null || !context.mounted) {
      setState(() => _loadingServices = false);
      return await _loadServices();
    }
    try {
      final responseRaw = await fetchData(context, endpoint);
      final response = jsonDecode(responseRaw) as List<dynamic>;
      _services.clear();
      _serviceColors.clear();
      setState(() {
        for (var elem in response) {
          try {
            final service = Service.fromJson(elem);
            _services.add(service);
            _serviceColors.add(Theme.of(context).colorScheme.surface);
          } catch (err) {
            log(
              '_loadServices: ${err.toString()} ${elem.toString()}',
              time: DateTime.now(),
            );
          }
        }
        _services.sort((s1, s2) => s1.name.compareTo(s2.name));
      });
      return;
    } catch (e) {
      log('_loadServices: $e', time: DateTime.now());
    } finally {
      setState(() => _loadingServices = false);
    }
    return await _loadServices();
  }

  @override
  void initState() {
    super.initState();
    _loadUserInfos();
    _loadAreas();
    _loadServices();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading || _infos == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 50.0),
          child: Column(
            children: [
              AreaTitle(
                title: AppLocalizations.of(context)!.profile, // 'Profile'
              ),
              Padding(
                padding: const EdgeInsets.only(top: 50.0),
                child: CircularProgressIndicator(
                  semanticsLabel: AppLocalizations.of(context)!.loading,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 50.0),
        child: Column(
          children: [
            AreaTitle(
              title: AppLocalizations.of(context)!.profile, // 'Profile'
            ),
            Padding(
              padding: const EdgeInsets.only(top: 30.0, bottom: 10.0),
              child: Column(
                children: [
                  Icon(
                    Icons.person_outline,
                    size: 200,
                    semanticLabel: AppLocalizations.of(context)!.profileInfos,
                    color: Theme.of(context).colorScheme.onSurface,
                  ),
                  AreaText(
                    _infos!.name,
                    style: Theme.of(context).textTheme.titleMedium,
                    color: Theme.of(context).colorScheme.onSurface,
                  ),
                  Padding(
                    padding: const EdgeInsets.only(top: 8.0),
                    child: AreaText(
                      _infos!.email,
                      color: Theme.of(context).colorScheme.onSurface,
                    ),
                  ),
                  ProfileDivider(),
                  ProfileElement(
                    loading: _loadingAreas,
                    title: 'AREAs',
                    items: _areas
                        .asMap()
                        .map(
                          (i, area) {
                            area.title =
                                'AREA ${i + 1}\n${area.name.formatAreaName(context)}';
                            return MapEntry(i, area);
                          },
                        )
                        .values
                        .toList(),
                    colorBuilder: (area) async => getAreaColor(context, area),
                    emptyMessage: AppLocalizations.of(context)!.noAreasYet,
                    onTap: (index) async {
                      final res = await showDialog(
                        context: context,
                        builder: (context) => AreaModal(
                          area: _areas[index],
                          id: index,
                        ),
                      ) as bool?;
                      if (res != null && res == true) {
                        setState(() => _areas.removeAt(index));
                      }
                    },
                  ),
                  ProfileDivider(),
                  ProfileElement(
                    loading: _loadingServices,
                    title: AppLocalizations.of(context)!.servicesConnected,
                    items: _services,
                    colors: _serviceColors,
                    onTap: (index) async {
                      final res = await showDialog(
                        context: context,
                        builder: (context) => ServiceModal(
                          service: _services[index],
                        ),
                      ) as bool?;
                      if (res != null && res == true) {
                        setState(() => _services.removeAt(index));
                      }
                    },
                  ),
                  Padding(
                    padding: const EdgeInsets.only(top: 20.0),
                    child: SizedBox(
                      width: 200,
                      child: OutlinedButton(
                        onPressed: () => context.goNamed('/logout'),
                        style: ButtonStyle(
                          backgroundColor: WidgetStatePropertyAll(
                            Colors.red.shade200,
                          ),
                          side: WidgetStatePropertyAll(
                            BorderSide(
                                width: 4.0,
                                color: Theme.of(context).colorScheme.onSurface),
                          ),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.logout,
                                color: Theme.of(context).colorScheme.onSurface,
                                size: 35,
                              ),
                              AreaText(
                                AppLocalizations.of(context)!
                                    .logOut
                                    .capitalizeOn(' '),
                                selectable: false,
                                style:
                                    Theme.of(context).textTheme.headlineSmall,
                                color: Theme.of(context).colorScheme.onSurface,
                                fontWeight: FontWeight.w800,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ProfileElement<E> extends StatefulWidget {
  const ProfileElement({
    super.key,
    required this.title,
    required this.items,
    required this.onTap,
    this.loading = false,
    this.emptyMessage,
    this.colors,
    this.colorBuilder,
    this.borderColor,
  });

  final String title;
  final List<E> items;
  final String? emptyMessage;
  final void Function(int) onTap;
  final List<Color?>? colors;
  final Future<Color?> Function(E)? colorBuilder;
  final bool loading;
  final Color? borderColor;

  @override
  State<ProfileElement<E>> createState() => _ProfileElementState<E>();
}

class _ProfileElementState<E> extends State<ProfileElement<E>> {
  final _scrollController = ScrollController();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8.0),
          child: AreaText(
            '${widget.title} (${widget.loading ? '?' : widget.items.length})',
            style: Theme.of(context).textTheme.titleMedium,
            color: Theme.of(context).colorScheme.onSurface,
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: SizedBox(
            height: 200,
            child: Card(
              color: Theme.of(context).brightness == Brightness.light
                  ? Theme.of(context).colorScheme.tertiary
                  : Theme.of(context).colorScheme.primary,
              child: widget.loading
                  ? Center(
                      child: CircularProgressIndicator(
                        color: Theme.of(context).colorScheme.onPrimary,
                      ),
                    )
                  : widget.items.isEmpty
                      ? Center(
                          child: AreaText(
                            widget.emptyMessage ??
                                AppLocalizations.of(context)!.nothingToDisplay,
                            selectable: false,
                            style: Theme.of(context).textTheme.titleMedium,
                            color: Theme.of(context).colorScheme.onPrimary,
                          ),
                        )
                      : Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: RawScrollbar(
                            controller: _scrollController,
                            thumbColor: Theme.of(context).colorScheme.surface,
                            thumbVisibility: true,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12.0),
                              side: BorderSide(
                                  color:
                                      Theme.of(context).colorScheme.onSurface),
                            ),
                            mainAxisMargin: 4.0,
                            child: ListView.builder(
                              controller: _scrollController,
                              primary: false,
                              itemCount: widget.items.length,
                              itemBuilder: (context, i) => Card(
                                child: ActionCard(
                                  widget.items[i].toString(),
                                  borderColor: widget.borderColor,
                                  color: widget.colorBuilder == null &&
                                          widget.colors != null
                                      ? widget.colors![i]
                                      : null,
                                  backgroundColorBuilder: widget.colorBuilder !=
                                          null
                                      ? () async =>
                                          widget.colorBuilder!(widget.items[i])
                                      : null,
                                  onTap: () => widget.onTap(i),
                                ),
                              ),
                            ),
                          ),
                        ),
            ),
          ),
        ),
      ],
    );
  }
}

class ProfileDivider extends StatelessWidget {
  const ProfileDivider({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(30.0),
      child: Divider(
        color: Theme.of(context).colorScheme.onSurface,
      ),
    );
  }
}

import 'dart:async';
import 'dart:convert';
import 'dart:developer';

import 'package:area/components/ActionCard.dart';
import 'package:area/components/AreaAppBar.dart';
import 'package:area/components/AreaScaffold.dart';
import 'package:area/components/AreaSearchBar.dart';
import 'package:area/components/AreaText.dart';
import 'package:area/components/AreaTitle.dart';
import 'package:area/components/MenuDrawer.dart';
import 'package:area/components/ReloadButton.dart';
import 'package:area/pages/menu/actions/actions.dart';
import 'package:area/pages/menu/actions/create.dart';
import 'package:area/pages/menu/actions/reactions.dart';
import 'package:area/utils/api.dart';
import 'package:area/utils/area.dart';
import 'package:area/utils/http.dart';
import 'package:area/utils/string.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';

enum ServiceType {
  actions,
  reactions,
}

class ServicesPage extends StatelessWidget {
  ServicesPage({
    super.key,
    required this.type,
  });

  final ServiceType type;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    return AreaScaffold(
      scaffoldKey: _scaffoldKey,
      appBar: AreaAppBar(scaffoldKey: _scaffoldKey),
      drawer: const NavDrawer(),
      child: MainPage(type: type),
    );
  }
}

class MainPage extends StatefulWidget {
  const MainPage({
    super.key,
    required this.type,
  });

  final ServiceType type;

  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  final TextEditingController _controller = TextEditingController();
  bool _loadingServices = false;
  final List<AreaService> services = [];

  void searchService(String text) {
    setState(
      () => _controller.text = text,
    );
  }

  Future<void> _loadServices() async {
    setState(() => _loadingServices = true);
    final endpoint = await getAPIEndpointPath('services');
    if (endpoint == null) {
      setState(() => _loadingServices = false);
      return;
    }
    try {
      if (context.mounted) {
        final responseRaw = await fetchData(context, endpoint);
        final response = jsonDecode(responseRaw) as List<dynamic>;
        services.clear();
        setState(() {
          for (var elem in response) {
            try {
              final service = AreaService.fromJson(elem);
              if ((widget.type == ServiceType.actions &&
                      service.actions.isNotEmpty) ||
                  (widget.type == ServiceType.reactions &&
                      service.reactions.isNotEmpty)) {
                services.add(service);
              }
            } catch (err) {
              log(
                '_loadServices: ${err.toString()} ${elem.toString()}',
                time: DateTime.now(),
              );
            }
          }
          services.sort((s1, s2) => s1.name.compareTo(s2.name));
        });
      }
    } catch (e) {
      log('_loadServices: $e', time: DateTime.now());
    } finally {
      _loadingServices = false;
    }
  }

  Future<void> _handleRedirect(AreaService service) async {
    final res = await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) {
          if (widget.type == ServiceType.actions) {
            return ActionsPage(id: service.name, service: service);
          }
          return ReactionsPage(id: service.name, service: service);
        },
      ),
    ) as ActionInfo?;
    if (res != null) {
      if (context.mounted) {
        context.pop(ServiceReturnValue(serviceName: service.name, value: res));
      }
    }
  }

  @override
  void initState() {
    super.initState();
    _loadServices();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.only(top: 50.0, bottom: 20.0),
        child: Column(
          children: [
            AreaTitle(title: AppLocalizations.of(context)!.chooseService),
            AreaSearchBar(
              controller: _controller,
              onChanged: searchService,
              itemBuilder: (context, suggestion) => ListTile(
                title: AreaText(
                  suggestion.name.formatNameTitle(),
                  selectable: false,
                  textAlign: TextAlign.start,
                  color: Theme.of(context).colorScheme.onSurface,
                ),
              ),
              onSuggestionSelected: (suggestion) {
                searchService(
                  suggestion.name.formatNameTitle(),
                );
              },
              suggestionsCallback: (pattern) => services
                  .where((service) => service.name
                      .formatNameTitle()
                      .toLowerCase()
                      .contains(pattern.formatNameTitle().toLowerCase()))
                  .toList(),
            ),
            _loadingServices
                ? Padding(
                    padding: const EdgeInsets.only(top: 12.0),
                    child: CircularProgressIndicator(
                      color: Theme.of(context).colorScheme.onSurface,
                    ),
                  )
                : Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: services.isEmpty
                        ? ReloadButton(
                            loading: _loadingServices,
                            onPressed: _loadServices,
                          )
                        : GridView.count(
                            primary: false,
                            mainAxisSpacing: 12.0,
                            crossAxisSpacing: 12.0,
                            crossAxisCount:
                                MediaQuery.of(context).size.width > 680 ? 4 : 2,
                            shrinkWrap: true,
                            children: services
                                .where(
                                  (service) => service.name
                                      .formatNameTitle()
                                      .toLowerCase()
                                      .contains(_controller.text.isEmpty
                                          ? service.name
                                              .formatNameTitle()
                                              .toLowerCase()
                                          : _controller.text
                                              .formatNameTitle()
                                              .toLowerCase()),
                                )
                                .map(
                                  (service) => ActionCard(
                                    service.name.formatNameTitle(),
                                    color: service.color,
                                    sharp: true,
                                    onTap: () => _handleRedirect(service),
                                  ),
                                )
                                .toList(),
                          ),
                  )
          ],
        ),
      ),
    );
  }
}

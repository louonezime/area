import 'dart:convert';
import 'dart:developer';

import 'package:area/components/AreaSnackBar.dart';
import 'package:area/components/AreaText.dart';
import 'package:area/components/AreaTitle.dart';
import 'package:area/components/DeleteButton.dart';
import 'package:area/components/DeleteConfirmationModal.dart';
import 'package:area/utils/api.dart';
import 'package:area/utils/color.dart';
import 'package:area/utils/http.dart';
import 'package:area/utils/string.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';

class ActionAuth {
  const ActionAuth({
    required this.type,
    required this.hint,
    required this.url,
  });

  final String? type;
  final String? hint;
  final String? url;

  factory ActionAuth.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'type': String? type,
        'hint': String? hint,
        'url': String? url,
      } =>
        ActionAuth(
          type: type,
          hint: hint,
          url: url,
        ),
      _ => throw const FormatException('Failed to load action auth'),
    };
  }
}

class ActionForm {
  ActionForm({
    required this.title,
    required this.name,
    required this.hint,
    this.value,
    this.valueList,
  });

  final String title;
  final String name;
  final String? hint;
  String? value;
  List<String>? valueList;

  factory ActionForm.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'title': String title,
        'name': String name,
        'value': dynamic value,
        'hint': String? hint,
      } =>
        ActionForm(
          title: title,
          name: name,
          value: value.runtimeType == String ? value : null,
          valueList: value.runtimeType == List
              ? (value as List).map((val) => val.toString()).toList()
              : null,
          hint: hint,
        ),
      _ => throw const FormatException('Failed to load action form'),
    };
  }
}

class ActionInfo {
  ActionInfo({
    required this.title,
    required this.name,
    required this.description,
    required this.form,
  });

  final String title;
  final String name;
  final String description;
  List<ActionForm> form;

  factory ActionInfo.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'title': String title,
        'name': String name,
        'description': String description,
        'form': List<dynamic> form,
      } =>
        ActionInfo(
          title: title,
          name: name,
          description: description,
          form: form.map((elem) => ActionForm.fromJson(elem)).toList(),
        ),
      _ => throw const FormatException('Failed to load action infos'),
    };
  }
}

class AreaService {
  const AreaService({
    required this.name,
    required this.color,
    required this.auth,
    required this.actions,
    required this.reactions,
  });

  final String name;
  final Color color;
  final ActionAuth auth;
  final List<ActionInfo> actions;
  final List<ActionInfo> reactions;

  factory AreaService.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'name': String name,
        'color': String color,
        'auth': dynamic auth,
        'actions': List<dynamic> actions,
        'reactions': List<dynamic> reactions,
      } =>
        AreaService(
          name: name,
          color: Color(
            int.parse(color.replaceAll('#', '').padLeft(8, 'F'), radix: 16),
          ),
          auth: ActionAuth.fromJson(auth),
          actions: actions.map((elem) => ActionInfo.fromJson(elem)).toList(),
          reactions:
              reactions.map((elem) => ActionInfo.fromJson(elem)).toList(),
        ),
      _ => throw const FormatException('Failed to load action'),
    };
  }
}

class Area {
  Area({
    required this.id,
    required this.name,
    required this.userId,
    required this.actionId,
    required this.reactionId,
    this.color,
  });

  final int id;
  final String name;
  String? title;
  final int userId;
  final int actionId;
  final int reactionId;
  Color? color;

  factory Area.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': int id,
        'name': String name,
        'userId': int userId,
        'actionId': int actionId,
        'reactionId': int reactionId,
      } =>
        Area(
          id: id,
          name: name,
          userId: userId,
          actionId: actionId,
          reactionId: reactionId,
        ),
      _ => throw const FormatException('Failed to load area'),
    };
  }

  @override
  String toString() {
    return title ?? name;
  }
}

class Service {
  Service({
    required this.id,
    required this.name,
    required this.color,
    required this.state,
    required this.type,
  });

  final int id;
  String name;
  final Color color;
  final String state;
  final String? type;

  factory Service.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': int id,
        'name': String name,
        'color': String color,
        'state': String state,
        'type': String? type,
      } =>
        Service(
          id: id,
          name: name,
          color: Color(
            int.parse(color.replaceAll('#', '').padLeft(8, 'F'), radix: 16),
          ),
          state: state,
          type: type,
        ),
      _ => throw const FormatException('Failed to load service'),
    };
  }

  @override
  String toString() {
    return name.formatNameTitle();
  }
}

class Action {
  const Action({
    required this.id,
    required this.serviceId,
    required this.title,
    required this.name,
    required this.payload,
    required this.lastState,
    required this.description,
  });

  final int id;
  final int serviceId;
  final String title;
  final String name;
  final Map<String, dynamic> payload;
  final List<String> lastState;
  final String description;

  factory Action.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': int id,
        'serviceId': int serviceId,
        'title': String title,
        'name': String name,
        'payload': Map<String, dynamic> payload,
        'lastState': List<dynamic> lastState,
        'description': String description,
      } =>
        Action(
          id: id,
          serviceId: serviceId,
          title: title,
          name: name,
          payload: payload,
          lastState: lastState.map((state) => state.toString()).toList(),
          description: description,
        ),
      _ => throw const FormatException('Failed to load action'),
    };
  }

  @override
  String toString() {
    return title;
  }
}

class Reaction {
  const Reaction({
    required this.id,
    required this.serviceId,
    required this.title,
    required this.name,
    required this.payload,
    required this.description,
  });

  final int id;
  final int serviceId;
  final String title;
  final String name;
  final Map<String, dynamic> payload;
  final String description;

  factory Reaction.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'id': int id,
        'serviceId': int serviceId,
        'title': String title,
        'name': String name,
        'payload': Map<String, dynamic> payload,
        'description': String description,
      } =>
        Reaction(
          id: id,
          serviceId: serviceId,
          title: title,
          name: name,
          payload: payload,
          description: description,
        ),
      _ => throw const FormatException('Failed to load reaction'),
    };
  }

  @override
  String toString() {
    return title;
  }
}

Future<bool> deleteArea(BuildContext context, int id) async {
  final endpoint = await getAPIEndpointPath(
    'area-delete',
    dynamicRoutes: [id.toString()],
  );
  if (endpoint == null) {
    return false;
  }
  try {
    if (context.mounted) {
      await deleteData(context, endpoint);
    }
    return true;
  } catch (e) {
    log('deleteArea: ${e.toString()}', time: DateTime.now());
  }
  return false;
}

Future<bool> deleteService(BuildContext context, String name) async {
  final endpoint = await getAPIEndpointPath(
    'service-delete',
    dynamicRoutes: [name],
  );
  if (endpoint == null) {
    return false;
  }
  try {
    if (context.mounted) {
      await deleteData(context, endpoint);
    }
    return true;
  } catch (e) {
    log('deleteService: ${e.toString()}', time: DateTime.now());
  }
  return false;
}

Future<Action?> getAction(BuildContext context, int id) async {
  final endpoint =
      await getAPIEndpointPath('action', dynamicRoutes: [id.toString()]);
  if (endpoint == null || !context.mounted) {
    return null;
  }
  try {
    final responseRaw =
        await fetchData(context, endpoint, redirectOnError: false);
    final response = jsonDecode(responseRaw);
    final action = Action.fromJson(response);
    return action;
  } catch (e) {
    log('getAction: $e', time: DateTime.now());
  }
  return null;
}

Future<Service?> getService(BuildContext context, int id) async {
  final endpoint =
      await getAPIEndpointPath('service', dynamicRoutes: [id.toString()]);
  if (endpoint == null || !context.mounted) {
    return null;
  }
  try {
    final responseRaw =
        await fetchData(context, endpoint, redirectOnError: false);
    final response = jsonDecode(responseRaw);
    final service = Service.fromJson(response);
    return service;
  } catch (e) {
    log('getService: $e', time: DateTime.now());
  }
  return null;
}

Future<Color?> getAreaColor(BuildContext context, Area area) async {
  final action = await getAction(context, area.actionId);
  if (action == null || !context.mounted) {
    return null;
  }
  final service = await getService(context, action.serviceId);
  if (service != null) {
    return service.color;
  }
  return null;
}

Future<List<Area>> setAreaColors(
  BuildContext context,
  List<Area> areas,
) async {
  for (var areaVar in areas) {
    areaVar.color = await getAreaColor(context, areaVar);
  }
  return areas;
}

class AreaModal extends StatefulWidget {
  const AreaModal({
    super.key,
    required this.area,
    required this.id,
  });

  final Area area;
  final int id;

  @override
  State<AreaModal> createState() => _AreaModalState();
}

class _AreaModalState extends State<AreaModal> {
  Action? _action;
  Reaction? _reaction;

  Future<void> _loadAction() async {
    final endpoint = await getAPIEndpointPath(
      'action',
      dynamicRoutes: [widget.area.actionId.toString()],
    );
    if (endpoint == null) {
      return;
    }
    try {
      if (context.mounted) {
        final responseRaw = await fetchData(context, endpoint);
        final response = jsonDecode(responseRaw);
        setState(() {
          try {
            final action = Action.fromJson(response);
            _action = action;
          } catch (err) {
            log(
              '_loadAction: ${err.toString()} ${response.toString()}',
              time: DateTime.now(),
            );
          }
        });
      }
    } catch (e) {
      log('_loadAction: ${e.toString()}', time: DateTime.now());
    }
  }

  Future<void> _loadReaction() async {
    final endpoint = await getAPIEndpointPath(
      'reaction',
      dynamicRoutes: [widget.area.reactionId.toString()],
    );
    if (endpoint == null) {
      return;
    }
    try {
      if (context.mounted) {
        final responseRaw = await fetchData(context, endpoint);
        final response = jsonDecode(responseRaw);
        setState(() {
          try {
            final reaction = Reaction.fromJson(response);
            _reaction = reaction;
          } catch (err) {
            log(
              '_loadReaction: ${err.toString()} ${response.toString()}',
              time: DateTime.now(),
            );
          }
        });
      }
    } catch (e) {
      log('_loadReaction: ${e.toString()}', time: DateTime.now());
    }
  }

  Future<void> _deleteArea() async {
    final res = await showDialog(
      context: context,
      builder: (context) => DeleteConfirmationModal(
        message: AppLocalizations.of(context)!.areaDeletionConfirmation,
      ),
    ) as bool?;
    if (res == null || res == false) {
      return;
    }
    if (context.mounted) {
      final res = await deleteArea(context, widget.area.id);
      if (context.mounted) {
        printResult(
          context,
          res,
          errorMessage: AppLocalizations.of(context)!.error500,
          successMessage: AppLocalizations.of(context)!.areaDeleteSuccess,
        );
        context.pop(res);
      }
    }
  }

  @override
  void initState() {
    super.initState();
    _loadAction();
    _loadReaction();
  }

  @override
  Widget build(BuildContext context) {
    final backgroundColor = widget.area.color != null
        ? widget.area.color!
        : Theme.of(context).colorScheme.primary;
    final foregroundColor = backgroundColor.getMatchingColor();

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)),
      backgroundColor: backgroundColor,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 20.0),
        child: RawScrollbar(
          thumbColor: foregroundColor,
          thumbVisibility: true,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.0),
          ),
          crossAxisMargin: 6.0,
          child: SingleChildScrollView(
            primary: true,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                AreaTitle(
                  title: 'AREA ${widget.id + 1}',
                  style: Theme.of(context).textTheme.titleMedium,
                  color: foregroundColor,
                ),
                Padding(
                  padding: const EdgeInsets.only(
                    left: 12.0,
                    right: 12.0,
                    bottom: 20.0,
                  ),
                  child: AreaText(
                    widget.area.name.formatAreaName(context),
                    style: Theme.of(context).textTheme.titleSmall,
                    color: foregroundColor,
                  ),
                ),
                if (_action != null)
                  AreaInfoTile(
                    type: AppLocalizations.of(context)!.action,
                    name: _action!.name,
                    description: _action!.description,
                    serviceId: _action!.serviceId,
                  ),
                if (_reaction != null)
                  AreaInfoTile(
                    type: AppLocalizations.of(context)!.reaction,
                    name: _reaction!.name,
                    description: _reaction!.description,
                    serviceId: _action!.serviceId,
                  ),
                Padding(
                  padding: const EdgeInsets.only(top: 20.0),
                  child: DeleteButton(onPressed: _deleteArea),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class AreaInfoTile extends StatefulWidget {
  const AreaInfoTile({
    super.key,
    required this.type,
    required this.name,
    required this.description,
    required this.serviceId,
  });

  final String type;
  final String name;
  final String description;
  final int serviceId;

  @override
  State<AreaInfoTile> createState() => _AreaInfoTileState();
}

class _AreaInfoTileState extends State<AreaInfoTile> {
  String _serviceName = '';

  @override
  void initState() {
    super.initState();
    getService(context, widget.serviceId).then((service) {
      setState(() => _serviceName = service?.name.formatNameTitle() ?? '');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 10.0),
      child: Card(
        color: Theme.of(context).colorScheme.surface,
        child: Padding(
          padding: const EdgeInsets.all(10.0),
          child: ListView(
            primary: false,
            shrinkWrap: true,
            children: [
              AreaText(
                '${widget.type} ($_serviceName)',
                style: Theme.of(context).textTheme.titleSmall,
                color: Theme.of(context).colorScheme.onSurface,
              ),
              AreaText(
                widget.name.capitalizeOn('_').replaceAll('_', ' '),
                style: Theme.of(context).textTheme.headlineMedium,
                color: Theme.of(context).colorScheme.onSurface,
              ),
              Padding(
                padding: const EdgeInsets.only(top: 10.0),
                child: AreaText(
                  widget.description,
                  style: Theme.of(context).textTheme.bodyLarge,
                  color: Theme.of(context).colorScheme.onSurface,
                  textAlign: TextAlign.justify,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ServiceModal extends StatefulWidget {
  const ServiceModal({
    super.key,
    required this.service,
  });

  final Service service;

  @override
  State<ServiceModal> createState() => _ServiceModalState();
}

class _ServiceModalState extends State<ServiceModal> {
  late final Color _textColor;

  Future<void> _deleteService() async {
    final res = await showDialog(
      context: context,
      builder: (context) => DeleteConfirmationModal(
        message: AppLocalizations.of(context)!.serviceDeletionConfirmation(
          widget.service.name.formatNameTitle(),
        ),
      ),
    ) as bool?;
    if (res == null || res == false) {
      return;
    }
    if (context.mounted) {
      final res = await deleteService(context, widget.service.name);
      if (context.mounted) {
        printResult(
          context,
          res,
          errorMessage: AppLocalizations.of(context)!.error500,
          successMessage: AppLocalizations.of(context)!.serviceDeleteSuccess(
            widget.service.name.formatNameTitle(),
          ),
        );
        context.pop(res);
      }
    }
  }

  @override
  void initState() {
    super.initState();
    _textColor = widget.service.color.getMatchingColor();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)),
      backgroundColor: widget.service.color,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 20.0),
        child: RawScrollbar(
          thumbColor: _textColor,
          thumbVisibility: true,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.0),
          ),
          crossAxisMargin: 6.0,
          child: SingleChildScrollView(
            primary: true,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                AreaTitle(
                  title: AppLocalizations.of(context)!.service,
                  style: Theme.of(context).textTheme.titleMedium,
                  color: _textColor,
                ),
                Padding(
                  padding: const EdgeInsets.only(
                    left: 12.0,
                    right: 12.0,
                    bottom: 20.0,
                  ),
                  child: AreaText(
                    widget.service.name.formatNameTitle(),
                    style: Theme.of(context).textTheme.titleSmall,
                    color: _textColor,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(
                      vertical: 4.0, horizontal: 10.0),
                  child: Card(
                    color: Theme.of(context).colorScheme.surface,
                    child: Padding(
                      padding: const EdgeInsets.all(10.0),
                      child: ListView(
                        primary: false,
                        shrinkWrap: true,
                        children: [
                          AreaText(
                            AppLocalizations.of(context)!.authType,
                            style: Theme.of(context).textTheme.headlineMedium,
                            color: Theme.of(context).colorScheme.onSurface,
                          ),
                          Padding(
                            padding: const EdgeInsets.only(top: 10.0),
                            child: AreaText(
                              widget.service.type?.capitalize() ??
                                  AppLocalizations.of(context)!.none,
                              style: Theme.of(context).textTheme.headlineSmall,
                              color: Theme.of(context).colorScheme.onSurface,
                              fontWeight: FontWeight.normal,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 20.0),
                  child: DeleteButton(onPressed: _deleteService),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

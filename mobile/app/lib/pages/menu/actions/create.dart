import 'package:area/components/AreaAppBar.dart';
import 'package:area/components/AreaScaffold.dart';
import 'package:area/components/AreaText.dart';
import 'package:area/components/MenuDrawer.dart';
import 'package:area/pages/menu/actions/services.dart';
import 'package:area/utils/area.dart';
import 'package:area/utils/string.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';

class ServiceReturnValue {
  const ServiceReturnValue({
    required this.serviceName,
    required this.value,
  });

  final String serviceName;
  final ActionInfo value;
}

class CreatePageReturnValue {
  const CreatePageReturnValue({
    required this.action,
    required this.reaction,
  });

  final ServiceReturnValue action;
  final ServiceReturnValue reaction;
}

class CreatePage extends StatelessWidget {
  CreatePage({super.key});

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
  ServiceReturnValue? _action;
  ServiceReturnValue? _reaction;
  bool _loading = false;

  Future<void> _handleSubmit() async {
    setState(() => _loading = true);
    if (_action == null || _reaction == null) {
      setState(() => _loading = false);
      return;
    }
    setState(() => _loading = false);
    context.pushNamed(
      '/review',
      extra: CreatePageReturnValue(action: _action!, reaction: _reaction!),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.only(top: 50.0, bottom: 20.0),
        child: Column(
          children: [
            AreaText(
              AppLocalizations.of(context)!.create, // 'Create'
              style: Theme.of(context).textTheme.titleLarge,
              color: Theme.of(context).colorScheme.onSurface,
            ),
            Padding(
              padding: const EdgeInsets.only(top: 60.0),
              child: Column(
                children: [
                  CreateButton(
                    _action,
                    type: ServiceType.actions,
                    onReturn: (val) => setState(() => _action = val),
                  ),
                  if (_action != null || _reaction != null)
                    AreaVerticalDivider(),
                  if (_action != null || _reaction != null)
                    CreateButton(
                      _reaction,
                      type: ServiceType.reactions,
                      onReturn: (val) => setState(() => _reaction = val),
                    ),
                  if (_action != null && _reaction != null)
                    AreaVerticalDivider(),
                  if (_action != null && _reaction != null)
                    ElevatedButton(
                      style: ButtonStyle(
                        backgroundColor: WidgetStatePropertyAll(
                            Theme.of(context).colorScheme.primary),
                        fixedSize: WidgetStatePropertyAll(Size.fromWidth(
                            MediaQuery.of(context).size.width * 0.8)),
                        shape: WidgetStatePropertyAll(
                          RoundedRectangleBorder(
                            borderRadius:
                                BorderRadius.all(Radius.circular(8.0)),
                          ),
                        ),
                      ),
                      onPressed: _handleSubmit,
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: _loading
                            ? CircularProgressIndicator(
                                color: Theme.of(context).colorScheme.onPrimary,
                              )
                            : AreaText(
                                AppLocalizations.of(context)!.submit,
                                selectable: false,
                                style: Theme.of(context).textTheme.titleLarge,
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

class AreaVerticalDivider extends StatelessWidget {
  const AreaVerticalDivider({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 8,
      height: 50,
      color: Theme.of(context).colorScheme.primary,
    );
  }
}

class CreateButton extends StatefulWidget {
  const CreateButton(
    this.data, {
    super.key,
    required this.type,
    required this.onReturn,
  });

  final ServiceReturnValue? data;
  final ServiceType type;
  final void Function(ServiceReturnValue?) onReturn;

  @override
  State<CreateButton> createState() => _CreateButtonState();
}

class _CreateButtonState extends State<CreateButton> {
  Future<void> _onTap() async {
    final res = await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => ServicesPage(type: widget.type),
      ),
    ) as ServiceReturnValue?;
    if (res != null) {
      widget.onReturn(res);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        if (widget.data != null)
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Theme.of(context).colorScheme.surface,
                  Theme.of(context).colorScheme.primary,
                ],
                stops: [0.0, 1.0],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
            padding: const EdgeInsets.all(0.0),
            width: MediaQuery.of(context).size.width * 0.8,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                BorderOuterRounded(corner: Corner.bottomRight),
                ServiceNameCard(
                    title: widget.data!.serviceName.formatNameTitle()),
                BorderOuterRounded(corner: Corner.bottomLeft),
              ],
            ),
          ),
        ElevatedButton(
          style: ButtonStyle(
            backgroundColor:
                WidgetStatePropertyAll(Theme.of(context).colorScheme.primary),
            fixedSize: WidgetStatePropertyAll(
                Size.fromWidth(MediaQuery.of(context).size.width * 0.8)),
            shape: WidgetStatePropertyAll(
              RoundedRectangleBorder(
                borderRadius: BorderRadius.all(Radius.circular(8.0)),
              ),
            ),
          ),
          onPressed: _onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16.0),
            child: Row(
              mainAxisAlignment: widget.data != null
                  ? MainAxisAlignment.spaceBetween
                  : MainAxisAlignment.center,
              children: [
                Flexible(
                  child: AreaText(
                    '${widget.type == ServiceType.actions ? AppLocalizations.of(context)!.areaIf : AppLocalizations.of(context)!.areaThen} ${widget.data?.value.title ?? (widget.type == ServiceType.actions ? AppLocalizations.of(context)!.areaThis : AppLocalizations.of(context)!.that)}',
                    selectable: false,
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                ),
                if (widget.data != null)
                  IconButton(
                    onPressed: () => widget.onReturn(null),
                    tooltip: AppLocalizations.of(context)!.delete,
                    icon: Icon(
                      Icons.delete,
                      size: 50,
                      color: Theme.of(context).colorScheme.onPrimary,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class ServiceNameCard extends StatelessWidget {
  const ServiceNameCard({
    super.key,
    required this.title,
  });

  final String title;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Theme.of(context).colorScheme.primary,
      margin: const EdgeInsets.all(0.0),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(12.0),
          topRight: Radius.circular(12.0),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
        child: AreaText(
          title,
          style: Theme.of(context).textTheme.titleMedium,
          color: Theme.of(context).colorScheme.onPrimary,
        ),
      ),
    );
  }
}

enum Corner {
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
}

class BorderOuterRounded extends StatelessWidget {
  const BorderOuterRounded({
    super.key,
    required this.corner,
    this.radius = 12.0,
  });

  final Corner corner;
  final double radius;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        height: 70,
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.only(
            topLeft: corner == Corner.topLeft
                ? Radius.circular(radius)
                : Radius.zero,
            topRight: corner == Corner.topRight
                ? Radius.circular(radius)
                : Radius.zero,
            bottomLeft: corner == Corner.bottomLeft
                ? Radius.circular(radius)
                : Radius.zero,
            bottomRight: corner == Corner.bottomRight
                ? Radius.circular(radius)
                : Radius.zero,
          ),
        ),
      ),
    );
  }
}

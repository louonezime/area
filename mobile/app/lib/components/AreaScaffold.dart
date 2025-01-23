import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

class AreaScaffold extends StatefulWidget {
  const AreaScaffold({
    super.key,
    required this.child,
    this.drawer,
    this.appBar,
    GlobalKey<ScaffoldState>? scaffoldKey,
  }) : _scaffoldKey = scaffoldKey;

  final Widget child;
  final Widget? drawer;
  final PreferredSizeWidget? appBar;
  final GlobalKey<ScaffoldState>? _scaffoldKey;

  @override
  State<AreaScaffold> createState() => _AreaScaffoldState();
}

class _AreaScaffoldState extends State<AreaScaffold> {
  final _scrollController = ScrollController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      key: widget._scaffoldKey,
      drawer: widget.drawer,
      appBar: widget.appBar,
      body: RawScrollbar(
        controller: _scrollController,
        thumbColor: Theme.of(context).colorScheme.onSurface,
        thumbVisibility: true,
        shape: RoundedRectangleBorder(
          side: BorderSide(color: Theme.of(context).colorScheme.surface),
          borderRadius: BorderRadius.circular(12.0),
        ),
        crossAxisMargin: 8.0,
        child: SingleChildScrollView(
          controller: _scrollController,
          child: SafeArea(child: widget.child),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: Theme.of(context).colorScheme.secondary,
        elevation: 8.0,
        tooltip: AppLocalizations.of(context)!.scrollToTop,
        onPressed: () => setState(
          () {
            _scrollController.animateTo(
              _scrollController.position.minScrollExtent,
              duration: const Duration(milliseconds: 1000),
              curve: Curves.easeInOutExpo,
            );
          },
        ),
        child: Icon(
          Icons.arrow_upward_rounded,
          color: Theme.of(context).colorScheme.onSecondary,
        ),
      ),
    );
  }
}

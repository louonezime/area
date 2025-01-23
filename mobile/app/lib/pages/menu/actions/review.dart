import 'dart:convert';
import 'dart:developer';

import 'package:area/components/AreaAppBar.dart';
import 'package:area/components/AreaConnectionForm.dart';
import 'package:area/components/AreaScaffold.dart';
import 'package:area/components/AreaSnackBar.dart';
import 'package:area/components/AreaText.dart';
import 'package:area/components/AreaTitle.dart';
import 'package:area/components/MenuDrawer.dart';
import 'package:area/pages/menu/actions/create.dart';
import 'package:area/utils/api.dart';
import 'package:area/utils/http.dart';
import 'package:area/utils/string.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';

class ReviewPage extends StatelessWidget {
  ReviewPage({
    super.key,
    required this.action,
    required this.reaction,
  });

  final ServiceReturnValue action;
  final ServiceReturnValue reaction;

  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    return AreaScaffold(
      scaffoldKey: _scaffoldKey,
      appBar: AreaAppBar(scaffoldKey: _scaffoldKey),
      drawer: const NavDrawer(),
      child: MainPage(action: action, reaction: reaction),
    );
  }
}

class MainPage extends StatefulWidget {
  const MainPage({
    super.key,
    required this.action,
    required this.reaction,
  });

  final ServiceReturnValue action;
  final ServiceReturnValue reaction;

  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  bool _loading = false;

  Future<void> _handleSubmit() async {
    setState(() => _loading = true);
    final endpoint = await getAPIEndpointPath('area-creation');
    if (endpoint == null || !context.mounted) {
      setState(() => _loading = false);
      printResult(
        context,
        false,
        errorMessage: AppLocalizations.of(context)!.error500,
      );
      return;
    }
    bool success = false;
    try {
      final dataAction =
          '{${widget.action.value.form.map((input) => '"${input.name}":"${input.value}"').join(',')}}';
      final dataReaction =
          '{${widget.reaction.value.form.map((input) => '"${input.name}":"${input.value}"').join(',')}}';
      final res = await postData(
        context,
        endpoint,
        body: {
          'action': {
            'name': widget.action.value.name,
            'service': widget.action.serviceName,
            'data': jsonDecode(dataAction),
          },
          'reaction': {
            'name': widget.reaction.value.name,
            'service': widget.reaction.serviceName,
            'data': jsonDecode(dataReaction),
          },
        },
        redirectOnError: false,
      );
      log('AREA creation result: $res', time: DateTime.now());
      success = true;
    } catch (e) {
      log('_handleSubmit: ${e.toString()}', time: DateTime.now());
    }
    setState(() => _loading = false);
    printResult(
      context,
      success,
      successMessage: AppLocalizations.of(context)!.areaCreateSuccess,
      errorMessage: AppLocalizations.of(context)!.error500,
    );
    if (context.mounted && success) {
      context.goNamed('/', extra: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.only(top: 50.0, bottom: 20.0),
        child: Column(
          children: [
            AreaTitle(title: AppLocalizations.of(context)!.review),
            Padding(
              padding: const EdgeInsets.only(top: 60.0),
              child:
                  RecapText(action: widget.action, reaction: widget.reaction),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 60.0),
              child: Column(
                children: [
                  ElevatedButton(
                    style: ButtonStyle(
                      backgroundColor: WidgetStatePropertyAll(
                          Theme.of(context).colorScheme.primary),
                      fixedSize: WidgetStatePropertyAll(Size.fromWidth(
                          MediaQuery.of(context).size.width * 0.8)),
                      shape: WidgetStatePropertyAll(
                        RoundedRectangleBorder(
                          borderRadius: BorderRadius.all(Radius.circular(8.0)),
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

class RecapText extends StatefulWidget {
  const RecapText({
    super.key,
    required this.action,
    required this.reaction,
  });

  final ServiceReturnValue action;
  final ServiceReturnValue reaction;

  @override
  State<RecapText> createState() => _RecapTextState();
}

class _RecapTextState extends State<RecapText> {
  final _scrollController = ScrollController();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: MediaQuery.of(context).size.width * 0.8,
      height: 400,
      child: Card(
        color: Theme.of(context).colorScheme.primary,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(8.0)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(4.0),
          child: Center(
            child: RawScrollbar(
              controller: _scrollController,
              thumbColor: Theme.of(context).colorScheme.onPrimary,
              thumbVisibility: true,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12.0),
              ),
              mainAxisMargin: 8.0,
              child: SingleChildScrollView(
                primary: true,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8.0),
                  child: ListView(
                    shrinkWrap: true,
                    controller: _scrollController,
                    children: [
                      RecapValues(
                        title: AppLocalizations.of(context)!.action,
                        infos: widget.action,
                      ),
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Divider(
                          thickness: 2.0,
                          color: Theme.of(context).colorScheme.onPrimary,
                        ),
                      ),
                      RecapValues(
                        title: AppLocalizations.of(context)!.reaction,
                        infos: widget.reaction,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class RecapValues extends StatefulWidget {
  const RecapValues({
    super.key,
    required this.title,
    required this.infos,
  });

  final String title;
  final ServiceReturnValue infos;

  @override
  State<RecapValues> createState() => _RecapValuesState();
}

class _RecapValuesState extends State<RecapValues> {
  bool _changeValue = false;
  late final List<TextEditingController> _controllers;
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(
      widget.infos.value.form.length,
      (index) =>
          TextEditingController(text: widget.infos.value.form[index].value),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        AreaText(
          '${widget.title} (${widget.infos.serviceName.formatNameTitle()})',
          style: Theme.of(context).textTheme.titleMedium,
        ),
        AreaText(
          widget.infos.value.title,
          style: Theme.of(context).textTheme.titleSmall,
        ),
        Padding(
          padding: const EdgeInsets.only(top: 8.0),
          child: Form(
            key: _formKey,
            child: ListView.builder(
              primary: false,
              shrinkWrap: true,
              itemCount: widget.infos.value.form.length,
              itemBuilder: (context, index) => ListTile(
                title: Row(
                  children: [
                    AreaText(
                      widget.infos.value.form[index].title,
                      style: Theme.of(context).textTheme.headlineSmall,
                      textAlign: TextAlign.start,
                    ),
                    if (widget.infos.value.form[index].hint != null)
                      Tooltip(
                        showDuration: Duration(days: 365), // no dismiss
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.onSecondary,
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                        textStyle: Theme.of(context)
                            .textTheme
                            .bodyLarge
                            ?.copyWith(
                              color: Theme.of(context).colorScheme.secondary,
                              fontWeight: FontWeight.bold,
                            ),
                        textAlign: TextAlign.center,
                        triggerMode: TooltipTriggerMode.tap,
                        message: widget.infos.value.form[index].hint,
                        child: Icon(
                          Icons.info_outline,
                          color: Theme.of(context).colorScheme.onSecondary,
                          size: 20,
                        ),
                      ),
                  ],
                ),
                subtitle: _changeValue
                    ? widget.infos.value.form[index].valueList != null
                        ? DropdownButton(
                            menuWidth: MediaQuery.of(context).size.width / 2,
                            isDense: true,
                            isExpanded: true,
                            dropdownColor:
                                Theme.of(context).colorScheme.secondary,
                            focusColor: Theme.of(context).colorScheme.secondary,
                            value: _controllers[index].text.isEmpty
                                ? null
                                : _controllers[index].text,
                            items: widget.infos.value.form[index].valueList!
                                .map(
                                  (domain) => DropdownMenuItem(
                                    value: domain,
                                    child: AreaText(
                                      getHostFromDomain(domain),
                                      selectable: false,
                                      color: Theme.of(context)
                                          .colorScheme
                                          .onSecondary,
                                    ),
                                  ),
                                )
                                .toList(),
                            onChanged: (entry) => setState(() {
                              _controllers[index].text = entry ?? '';
                            }),
                            hint: AreaText(
                              AppLocalizations.of(context)!.value(
                                widget.infos.value.form[index].title,
                              ),
                              selectable: false,
                            ),
                          )
                        : FormInput(
                            controller: _controllers[index],
                            fieldName: widget.infos.value.form[index].title,
                          )
                    : AreaText(
                        widget.infos.value.form[index].value!,
                        style: Theme.of(context).textTheme.bodyLarge,
                        textAlign: TextAlign.start,
                      ),
                trailing: IconButton(
                  onPressed: () {
                    if (_changeValue) {
                      _formKey.currentState!.save();
                      if (_formKey.currentState!.validate()) {
                        widget.infos.value.form[index].value =
                            _controllers[index].text;
                        setState(() => _changeValue = false);
                      }
                    } else {
                      setState(() => _changeValue = true);
                    }
                  },
                  icon: Icon(
                    _changeValue ? Icons.save : Icons.edit,
                    color: Theme.of(context).colorScheme.onPrimary,
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

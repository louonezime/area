import 'dart:convert';
import 'dart:developer';

import 'package:area/components/AreaSnackBar.dart';
import 'package:area/components/AreaText.dart';
import 'package:area/components/AreaTitle.dart';
import 'package:area/pages/redirect.dart';
import 'package:area/utils/api.dart';
import 'package:area/utils/area.dart';
import 'package:area/utils/color.dart';
import 'package:area/utils/http.dart';
import 'package:area/utils/string.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:form_validator/form_validator.dart';
import 'package:go_router/go_router.dart';

class AreaConnectionForm extends StatefulWidget {
  const AreaConnectionForm({
    super.key,
    required this.service,
    required this.infos,
  });

  final AreaService service;
  final ActionInfo infos;

  @override
  State<AreaConnectionForm> createState() => _AreaConnectionFormState();
}

class _AreaConnectionFormState extends State<AreaConnectionForm> {
  bool _connected = false;
  bool _loading = false;
  Color _textColor = Colors.white;

  Future<bool> callApiKeyCallback(String apiKey) async {
    final endpoint = await getAPIEndpointPath(
      'service-add-api-key',
      dynamicRoutes: [widget.service.name],
    );
    if (endpoint == null) {
      throw Exception('Could not find service api key backend API endpoint');
    }
    if (!context.mounted) {
      return false;
    }
    try {
      await postData(
        context,
        endpoint,
        body: {'apiKey': apiKey},
      );
      return true;
    } catch (e) {
      log('_callApiKeyCallback: $e', time: DateTime.now());
    }
    return false;
  }

  Future<bool> callNonAuthService() async {
    final endpoint = await getAPIEndpointPath(
      'service-register-normal',
      dynamicRoutes: [widget.service.name],
    );
    if (endpoint == null) {
      throw Exception(
        'Could not find service register for non auth backend API endpoint',
      );
    }
    if (!context.mounted) {
      return false;
    }
    try {
      await postData(
        context,
        endpoint,
      );
      return true;
    } catch (e) {
      log('callNonAuthService: $e', time: DateTime.now());
    }
    return false;
  }

  Future<bool> isAlreadyConnected() async {
    setState(() => _loading = true);
    final endpoint = await getAPIEndpointPath('my-services');
    if (endpoint == null) {
      throw Exception('Could not find my services backend API endpoint');
    }
    if (!context.mounted) {
      setState(() => _loading = false);
      return isAlreadyConnected();
    }
    try {
      final response =
          jsonDecode(await fetchData(context, endpoint)) as List<dynamic>;
      final connectedServices = response.map((serv) => serv['name']).toList();
      if (connectedServices.any((serv) => serv == widget.service.name)) {
        setState(() => _loading = false);
        return true;
      } else if (widget.service.auth.type == null) {
        final res = await callNonAuthService();
        setState(() => _loading = false);
        return res;
      }
    } catch (e) {
      log('isAlreadyConnected: ${e.toString()}', time: DateTime.now());
    }
    setState(() => _loading = false);
    return false;
  }

  void printResult(bool res) {
    if (res == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        successSnackBar(
          context: context,
          content: AppLocalizations.of(context)!.connectionSuccess,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        errorSnackBar(
          context: context,
          content: AppLocalizations.of(context)!.connectionError,
        ),
      );
    }
  }

  Future<void> handleRedirection(
      BuildContext context, String url, String page) async {
    final path = await getAPIEndpointPath(
      'service-oauth-callback',
      dynamicRoutes: [widget.service.name],
    );
    final uri = Uri.parse(url);
    if (!context.mounted) {
      log('handleRedirect: Context not mounted', time: DateTime.now());
      return;
    }
    if (path != null && uri.path.compareTo(path) == 0) {
      final content = await parsePage(page);
      if (content.containsKey('oauth_code')) {
        final endpoint = await getAPIEndpointPath(
          'service-oauth-callback-code-add',
          dynamicRoutes: [widget.service.name],
        );
        if (endpoint == null || !context.mounted) {
          if (context.mounted) {
            context.pop();
          }
          return;
        }
        try {
          final res = await fetchData(
            context,
            endpoint,
            params: {'code': content['oauth_code']},
          );
          final success = jsonDecode(res);
          if (context.mounted && success['success'] == true) {
            context.pop(true);
            return;
          }
        } catch (e) {
          log('handleRedirection: $e', time: DateTime.now());
        }
        if (context.mounted) {
          context.pop();
          return;
        }
      } else if (context.mounted) {
        context.pop();
      }
    }
  }

  Future<void> callReaction(String? apiKey) async {
    if (widget.service.auth.type == null) {
      final res = await callNonAuthService();
      if (!context.mounted) {
        return;
      }
      setState(() => _connected = res);
    } else if (widget.service.auth.type == 'apiKey') {
      final res = await callApiKeyCallback(apiKey!);
      if (!context.mounted) {
        return;
      }
      printResult(res);
      setState(() => _connected = res);
    } else {
      if (widget.service.auth.url == null) {
        printResult(false);
        return;
      }
      if (context.mounted) {
        final res = await Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => RedirectPage(
              key: UniqueKey(),
              url: widget.service.auth.url!,
              handleRedirection: handleRedirection,
            ),
          ),
        ) as bool?;
        if (context.mounted && res != null && res == true) {
          printResult(res);
          setState(() => _connected = true);
        } else {
          printResult(false);
        }
      }
    }
  }

  @override
  void initState() {
    super.initState();
    _textColor = widget.service.color.getMatchingColor();
    isAlreadyConnected().then((res) {
      setState(() => _connected = res);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)),
      backgroundColor: widget.service.color,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 20.0),
        child: RawScrollbar(
          thumbColor: Theme.of(context).colorScheme.onPrimary,
          thumbVisibility: true,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12.0),
          ),
          crossAxisMargin: 8.0,
          child: SingleChildScrollView(
            primary: true,
            child: _loading
                ? ModalScaffold(
                    serviceName: widget.service.name,
                    infos: widget.infos,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(top: 20.0),
                        child: CircularProgressIndicator(
                          color: _textColor,
                        ),
                      ),
                    ],
                  )
                : _connected
                    ? ConnectionForm(
                        serviceName: widget.service.name,
                        infos: widget.infos,
                        textColor: _textColor,
                      )
                    : AreaConnectionButton(
                        type: widget.service.auth.type,
                        callReaction: callReaction,
                        serviceName: widget.service.name,
                        hint: widget.service.auth.hint,
                        infos: widget.infos,
                        textColor: _textColor,
                      ),
          ),
        ),
      ),
    );
  }
}

class ModalScaffold extends StatelessWidget {
  const ModalScaffold({
    super.key,
    required this.serviceName,
    required this.infos,
    required this.children,
    this.textColor,
  });

  final String serviceName;
  final ActionInfo infos;
  final List<Widget> children;
  final Color? textColor;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        AreaTitle(
          title: serviceName.formatNameTitle(),
          style: Theme.of(context).textTheme.titleMedium,
          color: textColor,
        ),
        Padding(
          padding: const EdgeInsets.symmetric(
            vertical: 10.0,
            horizontal: 16.0,
          ),
          child: AreaText(
            infos.title,
            style: Theme.of(context).textTheme.headlineLarge,
            fontWeight: FontWeight.w800,
            color: textColor,
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(
            top: 10.0,
            left: 16.0,
            right: 16.0,
          ),
          child: AreaText(
            infos.description,
            style: Theme.of(context).textTheme.headlineSmall,
            color: textColor,
          ),
        ),
        for (Widget child in children) child,
      ],
    );
  }
}

class ConnectionForm extends StatefulWidget {
  const ConnectionForm({
    super.key,
    required this.serviceName,
    required this.infos,
    required this.textColor,
  });

  final String serviceName;
  final ActionInfo infos;
  final Color textColor;

  @override
  State<ConnectionForm> createState() => _ConnectionFormState();
}

class _ConnectionFormState extends State<ConnectionForm> {
  late final List<TextEditingController> _controllers;
  final _formKey = GlobalKey<FormState>();
  bool _loading = false;
  final _scrollController = ScrollController();

  Future<void> handleSubmit() async {
    setState(() => _loading = true);
    if (widget.infos.form.isEmpty) {
      setState(() => _loading = false);
      context.pop(<ActionForm>[]);
      return;
    }
    _formKey.currentState!.save();
    if (!_formKey.currentState!.validate()) {
      setState(() => _loading = false);
      return;
    }
    List<ActionForm> formValues = [];
    for (var i = 0; i < _controllers.length; i++) {
      formValues.add(
        ActionForm(
          title: widget.infos.form[i].title,
          name: widget.infos.form[i].name,
          value: _controllers[i].text,
          valueList: widget.infos.form[i].valueList,
          hint: widget.infos.form[i].hint,
        ),
      );
    }
    setState(() => _loading = false);
    context.pop(formValues);
  }

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(
      widget.infos.form.length,
      (_) => TextEditingController(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ModalScaffold(
      serviceName: widget.serviceName,
      infos: widget.infos,
      textColor: widget.textColor,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(
            vertical: 20.0,
            horizontal: 10.0,
          ),
          child: Card(
            color: Theme.of(context).colorScheme.surface,
            child: widget.infos.form.isEmpty
                ? Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: AreaText(
                      AppLocalizations.of(context)!.noInfosNeeded,
                      color: Theme.of(context).colorScheme.onSurface,
                      style: Theme.of(context).textTheme.headlineMedium,
                      fontWeight: FontWeight.w800,
                    ),
                  )
                : Form(
                    key: _formKey,
                    child: RawScrollbar(
                      controller: _scrollController,
                      thumbColor: widget.textColor,
                      thumbVisibility: true,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12.0),
                      ),
                      crossAxisMargin: 8.0,
                      child: SingleChildScrollView(
                        child: ListView.builder(
                          controller: _scrollController,
                          shrinkWrap: true,
                          primary: false,
                          itemCount: widget.infos.form.length,
                          itemBuilder: (context, index) => ListTile(
                            title: Row(
                              children: [
                                AreaText(
                                  widget.infos.form[index].title,
                                  textAlign: TextAlign.start,
                                  style: Theme.of(context)
                                      .textTheme
                                      .headlineMedium,
                                  color:
                                      Theme.of(context).colorScheme.onSurface,
                                ),
                                if (widget.infos.form[index].hint != null)
                                  AreaTooltip(
                                    hint: widget.infos.form[index].hint!,
                                  ),
                              ],
                            ),
                            subtitle: Padding(
                              padding:
                                  const EdgeInsets.symmetric(vertical: 8.0),
                              child: widget.infos.form[index].valueList != null
                                  ? DropdownButton(
                                      menuWidth:
                                          MediaQuery.of(context).size.width / 2,
                                      isDense: true,
                                      isExpanded: true,
                                      dropdownColor:
                                          Theme.of(context).colorScheme.primary,
                                      focusColor:
                                          Theme.of(context).colorScheme.primary,
                                      value: _controllers[index].text.isEmpty
                                          ? null
                                          : _controllers[index].text,
                                      items: widget.infos.form[index].valueList!
                                          .map(
                                            (domain) => DropdownMenuItem(
                                              value: domain,
                                              child: AreaText(
                                                getHostFromDomain(domain),
                                                selectable: false,
                                                color: Theme.of(context)
                                                    .colorScheme
                                                    .onPrimary,
                                              ),
                                            ),
                                          )
                                          .toList(),
                                      onChanged: (entry) => setState(() {
                                        _controllers[index].text = entry ?? '';
                                      }),
                                      hint: AreaText(
                                        AppLocalizations.of(context)!.value(
                                            widget.infos.form[index].title),
                                        selectable: false,
                                        color: Theme.of(context)
                                            .colorScheme
                                            .onSurface,
                                      ),
                                    )
                                  : FormInput(
                                      fieldName: widget.infos.form[index].title,
                                      controller: _controllers[index],
                                      digitsOnly:
                                          widget.infos.form[index].value ==
                                              'int',
                                      color: Theme.of(context)
                                          .colorScheme
                                          .onSurface,
                                    ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
          ),
        ),
        ElevatedButton(
          style: ButtonStyle(
            backgroundColor: WidgetStatePropertyAll(
              Theme.of(context).colorScheme.surface,
            ),
            elevation: WidgetStatePropertyAll(4.0),
          ),
          onPressed: handleSubmit,
          child: Padding(
            padding: const EdgeInsets.all(12.0),
            child: _loading
                ? CircularProgressIndicator(
                    color: Theme.of(context).colorScheme.onSurface,
                  )
                : AreaText(
                    AppLocalizations.of(context)!.submit,
                    selectable: false,
                    style: Theme.of(context).textTheme.headlineLarge,
                    color: Theme.of(context).colorScheme.onSurface,
                  ),
          ),
        ),
      ],
    );
  }
}

class AreaTooltip extends StatelessWidget {
  const AreaTooltip({
    super.key,
    required this.hint,
  });

  final String hint;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      showDuration: Duration(days: 365), // no dismiss
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary,
        borderRadius: BorderRadius.circular(12.0),
      ),
      textStyle: Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: Theme.of(context).colorScheme.onPrimary,
            fontWeight: FontWeight.bold,
          ),
      textAlign: TextAlign.center,
      triggerMode: TooltipTriggerMode.tap,
      message: hint,
      child: Icon(
        Icons.info_outline,
        color: Theme.of(context).colorScheme.onSurface,
        size: 20,
      ),
    );
  }
}

class FormInput extends StatelessWidget {
  const FormInput({
    super.key,
    this.fieldName,
    this.controller,
    this.digitsOnly = false,
    this.hideText = false,
    this.labelText,
    this.validator,
    this.suffixIcon,
    this.onSaved,
    this.keyboardType,
    this.color,
  });

  final String? fieldName;
  final TextEditingController? controller;
  final bool digitsOnly;
  final bool hideText;
  final String? labelText;
  final String? Function(String?)? validator;
  final Widget? suffixIcon;
  final void Function(String?)? onSaved;
  final TextInputType? keyboardType;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final label =
        labelText ?? AppLocalizations.of(context)!.value(fieldName ?? '');
    final validatorFunc = validator ??
        ValidationBuilder(
          requiredMessage: AppLocalizations.of(context)!
              .pleaseEnterAValue, // 'Please enter a value'
        ).required().build();
    return TextFormField(
      keyboardType: keyboardType ??
          (digitsOnly ? TextInputType.number : TextInputType.text),
      controller: controller,
      cursorColor: color ?? Theme.of(context).colorScheme.onPrimary,
      obscureText: hideText,
      style: TextStyle(color: color ?? Theme.of(context).colorScheme.onPrimary),
      onSaved: onSaved,
      decoration: InputDecoration(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.all(
            Radius.circular(8.0),
          ),
          borderSide: BorderSide(
            color: color ?? Theme.of(context).colorScheme.onPrimary,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(
            Radius.circular(8.0),
          ),
          borderSide: BorderSide(
            color: color ?? Theme.of(context).colorScheme.onPrimary,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(
            Radius.circular(8.0),
          ),
          borderSide: BorderSide(
            color: color ?? Theme.of(context).colorScheme.onPrimary,
          ),
        ),
        suffixIcon: suffixIcon,
        labelText: label,
        labelStyle:
            TextStyle(color: color ?? Theme.of(context).colorScheme.onPrimary),
      ),
      validator: validatorFunc,
    );
  }
}

class AreaConnectionButton extends StatefulWidget {
  const AreaConnectionButton({
    super.key,
    required this.type,
    required this.callReaction,
    required this.serviceName,
    required this.hint,
    required this.infos,
    required this.textColor,
  });

  final String? type;
  final Future<void> Function(String?) callReaction;
  final String serviceName;
  final String? hint;
  final ActionInfo infos;
  final Color textColor;

  @override
  State<AreaConnectionButton> createState() => _AreaConnectionButtonState();
}

class _AreaConnectionButtonState extends State<AreaConnectionButton> {
  final _controller = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return ModalScaffold(
      serviceName: widget.serviceName,
      infos: widget.infos,
      textColor: widget.textColor,
      children: [
        if (widget.type == 'apiKey')
          Padding(
            padding: const EdgeInsets.symmetric(
              vertical: 20.0,
              horizontal: 10.0,
            ),
            child: Card(
              color: Theme.of(context).colorScheme.surface,
              child: Form(
                key: _formKey,
                child: ListTile(
                  title: Row(
                    children: [
                      AreaText(
                        AppLocalizations.of(context)!.apiKey,
                        textAlign: TextAlign.start,
                        style: Theme.of(context).textTheme.headlineMedium,
                        color: widget.textColor,
                      ),
                      if (widget.hint != null) AreaTooltip(hint: widget.hint!),
                    ],
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: FormInput(
                      fieldName: AppLocalizations.of(context)!.apiKey,
                      controller: _controller,
                    ),
                  ),
                ),
              ),
            ),
          ),
        Padding(
          padding: const EdgeInsets.only(top: 20.0),
          child: ElevatedButton(
            style: ButtonStyle(
              backgroundColor: WidgetStatePropertyAll(
                Theme.of(context).colorScheme.surface,
              ),
              elevation: WidgetStatePropertyAll(4.0),
            ),
            onPressed: () {
              if (widget.type == 'apiKey') {
                _formKey.currentState!.save();
                if (_formKey.currentState!.validate()) {
                  widget.callReaction(_controller.text);
                }
              } else {
                widget.callReaction(_controller.text);
              }
            },
            child: AreaText(
              AppLocalizations.of(context)!.connect, // 'Connect'
              selectable: false,
              style: Theme.of(context).textTheme.headlineSmall,
              color: Theme.of(context).colorScheme.onSurface,
            ),
          ),
        ),
      ],
    );
  }
}

import 'dart:convert';
import 'dart:developer';

import 'package:area/components/AreaLogo.dart';
import 'package:area/components/AreaScaffold.dart';
import 'package:area/components/AreaSnackBar.dart';
import 'package:area/components/AreaText.dart';
import 'package:area/components/AuthForm.dart';
import 'package:area/components/ServiceButton.dart';
import 'package:area/components/WritableDivider.dart';
import 'package:area/pages/redirect.dart';
import 'package:area/utils/api.dart';
import 'package:area/utils/http.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return AreaScaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            IconButton(
              onPressed: () => context.pop(),
              icon: Icon(
                Icons.arrow_circle_left_outlined,
                color: Theme.of(context).colorScheme.onSurface,
                size: 40,
              ),
              tooltip: AppLocalizations.of(context)!.back,
            ),
            AreaLogo(color: Theme.of(context).colorScheme.onSurface),
            IconButton(
              onPressed: () => context.pushNamed('/settings'),
              icon: Icon(
                Icons.settings,
                color: Theme.of(context).colorScheme.onSurface,
                size: 40,
              ),
              tooltip: AppLocalizations.of(context)!.settings,
            ),
          ],
        ),
        backgroundColor: Theme.of(context).colorScheme.surface,
        surfaceTintColor: Theme.of(context).colorScheme.surface,
        centerTitle: true,
      ),
      child: MainPage(formKey: _formKey),
    );
  }
}

class MainPage extends StatefulWidget {
  const MainPage({
    super.key,
    required GlobalKey<FormState> formKey,
  }) : _formKey = formKey;

  final GlobalKey<FormState> _formKey;

  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  String _service = '';

  Future<void> _handleSubmit(
      BuildContext context, String email, String password) async {
    final endpoint = await getAPIEndpointPath('register');
    if (endpoint == null || !context.mounted) {
      log("Couldn't fetch API endpoint login", time: DateTime.now());
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          errorSnackBar(
            context: context,
            content: AppLocalizations.of(context)!.error500,
          ),
        );
      }
      return;
    }
    late String res;
    try {
      res = await postData(
        context,
        endpoint,
        body: {
          'name': email.split('@').first,
          'email': email,
          'password': password,
        },
        useToken: false,
        redirectOnError: false,
      );
    } on Error400 {
      log('Password is too short.', time: DateTime.now());
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          errorSnackBar(
            context: context,
            content: AppLocalizations.of(context)!.registerError400,
          ),
        );
      }
      return;
    } on Error409 {
      log('Email already in use.', time: DateTime.now());
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          errorSnackBar(
            context: context,
            content: AppLocalizations.of(context)!.registerError409,
          ),
        );
      }
      return;
    } catch (err) {
      log(err.toString(), time: DateTime.now());
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          errorSnackBar(
            context: context,
            content: AppLocalizations.of(context)!.error500,
          ),
        );
      }
      return;
    }
    try {
      final token = APIToken.fromJson(jsonDecode(res));
      await login(token.accessToken);
      if (context.mounted) {
        context.goNamed('/', extra: true);
      }
    } catch (err) {
      log(err.toString(), time: DateTime.now());
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          errorSnackBar(
            context: context,
            content: AppLocalizations.of(context)!.error500,
          ),
        );
      }
      return;
    }
  }

  Future<void> handleRedirection(
    BuildContext context,
    String url,
    String page,
  ) async {
    final path = await getAPIEndpointPath(
      'service-oauth2-callback',
      dynamicRoutes: [_service],
    );
    final uri = Uri.parse(url);
    if (!context.mounted) {
      return;
    }
    if (path != null && uri.path.compareTo(path) == 0) {
      final content = await parsePage(page);
      if (content.containsKey('access_token')) {
        final token = content['access_token'];
        await login(token);
        if (context.mounted) {
          context.pop(true);
        }
      } else if (context.mounted) {
        context.pop();
      }
    }
  }

  Future<void> _handleServiceConnection(String service) async {
    setState(() => _service = service);
    final url = await getAPIEndpointPath(
      'service-oauth2-init',
      dynamicRoutes: [_service],
    );
    final callback = await getAPIPath(
      'service-oauth2-callback',
      dynamicRoutes: [_service],
    );
    if (url == null || callback == null) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          errorSnackBar(
            context: context,
            content: AppLocalizations.of(context)!.error500,
          ),
        );
      }
      return;
    }
    if (context.mounted) {
      dynamic res;
      try {
        res = jsonDecode(await fetchData(
          context,
          url,
          params: {'redirect': callback},
        ));
      } on Error500 catch (e) {
        log('_handleServiceConnection: ${e.message}', time: DateTime.now());
      } catch (e) {
        log('_handleServiceConnection: ${e.toString()}', time: DateTime.now());
      }
      if (!context.mounted) {
        return;
      }
      if (res == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          errorSnackBar(
            context: context,
            content: AppLocalizations.of(context)!.error500,
          ),
        );
        return;
      }
      final result = await Navigator.of(context).push(
        MaterialPageRoute(
          builder: (context) => RedirectPage(
            url: res['redirectUrl'],
            handleRedirection: handleRedirection,
          ),
        ),
      ) as bool?;
      if (context.mounted && result != null && result == true) {
        context.goNamed('/', extra: true);
      } else if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          errorSnackBar(
            context: context,
            content: AppLocalizations.of(context)!.error500,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Center(
        child: Padding(
          padding: const EdgeInsets.only(top: 50.0, bottom: 20.0),
          child: SizedBox(
            width: MediaQuery.of(context).size.width * 0.85,
            child: Column(
              children: [
                AreaText(
                  AppLocalizations.of(context)!.signUp, // 'Sign up'
                  style: Theme.of(context).textTheme.titleLarge,
                  color: Theme.of(context).colorScheme.onSurface,
                ),
                AuthForm(
                  formKey: widget._formKey,
                  onSubmit: (email, password) =>
                      _handleSubmit(context, email, password),
                  confirmPassword: true,
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 8.0, right: 8.0),
                  child: WritableDivider(
                    text: AppLocalizations.of(context)!.or, // 'or'
                    outerMargin: 0.0,
                  ),
                ),
                ServiceButton(
                  'Google',
                  onPressed: () async =>
                      await _handleServiceConnection('google'),
                  buttonColor: Theme.of(context).colorScheme.onPrimary,
                  textColor: Theme.of(context).colorScheme.primary,
                ),
                ServiceButton(
                  'Discord',
                  onPressed: () async =>
                      await _handleServiceConnection('discord'),
                  buttonColor: const Color(0xFF5865F2),
                  borderColor: const Color(0xFF5865F2),
                  iconColor: Colors.white,
                  textColor: Colors.white,
                ),
                ServiceButton(
                  'Spotify',
                  onPressed: () async =>
                      await _handleServiceConnection('spotify'),
                  buttonColor: Colors.black,
                  borderColor: Colors.white,
                  iconColor: const Color(0xFF2EBD59),
                  textColor: Colors.white,
                ),
                ServiceButton(
                  'Gitlab',
                  onPressed: () async =>
                      await _handleServiceConnection('gitlab'),
                  buttonColor: const Color(0xFF554488),
                  borderColor: const Color(0xFF554488),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Wrap(
                    children: [
                      SelectableText.rich(
                        TextSpan(
                          text:
                              '${AppLocalizations.of(context)!.alreadyInArea} ', // 'Already in AREA? '
                          style: Theme.of(context)
                              .textTheme
                              .headlineSmall
                              ?.copyWith(
                                  color:
                                      Theme.of(context).colorScheme.onSurface),
                          children: [
                            TextSpan(
                              text:
                                  '${AppLocalizations.of(context)!.logInHere}.', // 'Log in here.'
                              style: Theme.of(context)
                                  .textTheme
                                  .headlineLarge
                                  ?.copyWith(
                                    decoration: TextDecoration.underline,
                                    decorationColor:
                                        Theme.of(context).colorScheme.onSurface,
                                    color:
                                        Theme.of(context).colorScheme.onSurface,
                                  ),
                              recognizer: TapGestureRecognizer()
                                ..onTap = () =>
                                    context.pushReplacementNamed('/login'),
                            ),
                          ],
                        ),
                        textAlign: TextAlign.center,
                      )
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

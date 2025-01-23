import 'package:area/pages/auth/login.dart';
import 'package:area/pages/auth/logout.dart';
import 'package:area/pages/auth/register.dart';
import 'package:area/pages/home.dart';
import 'package:area/pages/menu/about_this_project.dart';
import 'package:area/pages/menu/about_us.dart';
import 'package:area/pages/menu/actions/actions.dart';
import 'package:area/pages/menu/actions/create.dart';
import 'package:area/pages/menu/actions/reactions.dart';
import 'package:area/pages/menu/actions/review.dart';
import 'package:area/pages/menu/actions/services.dart';
import 'package:area/pages/menu/settings.dart';
import 'package:area/pages/profile.dart';
import 'package:area/pages/redirect.dart';
import 'package:area/utils/area.dart';
import 'package:area/utils/language.dart';
import 'package:area/utils/themes.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

void main() async {
  final themeProvider = ThemeProvider();
  final languageProvider = LanguageProvider();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => themeProvider),
        ChangeNotifierProvider(create: (_) => languageProvider),
      ],
      child: const MyApp(),
    ),
  );
  await themeProvider.load();
  await languageProvider.load();
}

final GoRouter _router = GoRouter(
  routes: [
    GoRoute(
      name: '/',
      path: '/',
      builder: (context, state) {
        if (state.extra.runtimeType != bool) {
          return HomePage(title: 'AREA');
        }
        final useUniqueKey = state.extra == null ? false : state.extra! as bool;
        return HomePage(key: useUniqueKey ? UniqueKey() : null, title: 'AREA');
      },
      routes: [
        GoRoute(
          name: '/login',
          path: 'login',
          builder: (context, state) => const LoginPage(),
        ),
        GoRoute(
          name: '/register',
          path: 'register',
          builder: (context, state) => const RegisterPage(),
        ),
        GoRoute(
          name: '/profile',
          path: 'profile',
          builder: (context, state) => ProfilePage(),
        ),
        GoRoute(
          name: '/logout',
          path: 'logout',
          builder: (context, state) => const LogoutPage(),
        ),
        GoRoute(
          name: '/create',
          path: 'create',
          builder: (context, state) => CreatePage(),
        ),
        GoRoute(
          name: '/services',
          path: 'services',
          builder: (context, state) => ServicesPage(
            type: state.extra! as ServiceType,
          ),
          routes: [
            GoRoute(
              path: 'actions/:service',
              builder: (context, state) => ActionsPage(
                id: state.pathParameters['service']!,
                service: state.extra! as AreaService,
              ),
            ),
            GoRoute(
              path: 'reactions/:service',
              builder: (context, state) => ReactionsPage(
                id: state.pathParameters['service']!,
                service: state.extra! as AreaService,
              ),
            ),
          ],
        ),
        GoRoute(
          name: '/redirect',
          path: 'redirect/:url',
          builder: (context, state) => RedirectPage(
            key: UniqueKey(),
            url: state.pathParameters['url']!,
          ),
        ),
        GoRoute(
          name: '/review',
          path: 'review',
          builder: (context, state) {
            final values = state.extra as CreatePageReturnValue;
            return ReviewPage(
              action: values.action,
              reaction: values.reaction,
            );
          },
        ),
        GoRoute(
          name: '/about-this-project',
          path: 'about-this-project',
          builder: (context, state) => const AboutThisProjectPage(),
        ),
        GoRoute(
          name: '/about-us',
          path: 'about-us',
          builder: (context, state) => const AboutUsPage(),
        ),
        GoRoute(
          name: '/settings',
          path: 'settings',
          builder: (context, state) => const SettingsPage(),
        ),
      ],
    ),
  ],
);

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerConfig: _router,
      title: 'AREA',
      theme: Provider.of<ThemeProvider>(context).themeData,
      locale: Provider.of<LanguageProvider>(context).locale,
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
    );
  }
}

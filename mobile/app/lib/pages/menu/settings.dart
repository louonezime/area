import 'package:area/components/AreaAppBar.dart';
import 'package:area/components/AreaScaffold.dart';
import 'package:area/components/AreaText.dart';
import 'package:area/components/AreaTitle.dart';
import 'package:area/components/MenuDrawer.dart';
import 'package:area/components/ThemeSwitchButton.dart';
import 'package:area/utils/api.dart';
import 'package:area/utils/language.dart';
import 'package:area/utils/themes.dart';
import 'package:country_flags/country_flags.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_typeahead/flutter_typeahead.dart';
import 'package:provider/provider.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    return AreaScaffold(
      scaffoldKey: _scaffoldKey,
      drawer: const NavDrawer(),
      appBar: AreaAppBar(scaffoldKey: _scaffoldKey),
      child: const MainPage(),
    );
  }
}

class MainPage extends StatelessWidget {
  const MainPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(
          vertical: 50.0,
        ),
        child: Column(
          children: [
            AreaTitle(
              title: AppLocalizations.of(context)!.settings, // 'Settings'
              style: Theme.of(context).textTheme.titleLarge,
              color: Theme.of(context).colorScheme.onSurface,
            ),
            Padding(
              padding: const EdgeInsets.only(top: 60.0),
              child: SizedBox(
                height: 400,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    SwitchTheme(),
                    SwitchLanguage(),
                    SwitchDomain(),
                    SizedBox(height: 50),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SwitchTheme extends StatelessWidget {
  const SwitchTheme({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10.0, horizontal: 20.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          AreaText(
            AppLocalizations.of(context)!.switchTheme,
            fontWeight: FontWeight.w800,
            color: Theme.of(context).colorScheme.onSurface,
          ),
          ThemeSwitchButton(
            onChanged: (val) {
              Provider.of<ThemeProvider>(context, listen: false).toggleTheme();
            },
            value: Provider.of<ThemeProvider>(context, listen: false)
                .isLightTheme(),
            tooltip: Provider.of<ThemeProvider>(context, listen: false)
                    .isLightTheme()
                ? AppLocalizations.of(context)!.lightTheme
                : AppLocalizations.of(context)!.darkTheme,
          ),
        ],
      ),
    );
  }
}

class SwitchLanguage extends StatefulWidget {
  const SwitchLanguage({super.key});

  @override
  State<SwitchLanguage> createState() => _SwitchLanguageState();
}

class _SwitchLanguageState extends State<SwitchLanguage> {
  final List<LanguageFlag> _languages = [
    LanguageFlag('en'),
    LanguageFlag('fr'),
  ];
  late final List<bool> _selectedLanguage;

  Future<void> loadLanguage() async {
    final language = await getLanguage();
    if (!_languages
        .map((elem) => elem.language)
        .toList()
        .contains(language.languageCode)) {
      setState(() => _selectedLanguage[0] = true);
    } else {
      setState(() => _selectedLanguage[_languages
          .map((elem) => elem.language)
          .toList()
          .indexOf(language.languageCode)] = true);
    }
  }

  @override
  void initState() {
    super.initState();
    _selectedLanguage = List.generate(_languages.length, (index) => false);
    loadLanguage();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10.0, horizontal: 20.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          AreaText(
            AppLocalizations.of(context)!.changeLanguage,
            fontWeight: FontWeight.w800,
            color: Theme.of(context).colorScheme.onSurface,
          ),
          ToggleButtons(
            borderRadius: const BorderRadius.all(Radius.circular(8.0)),
            onPressed: (index) => setState(() {
              for (int i = 0; i < _selectedLanguage.length; i++) {
                _selectedLanguage[i] = i == index;
              }
              Provider.of<LanguageProvider>(context, listen: false)
                  .changeLanguage(_languages[index].language);
            }),
            selectedColor: Theme.of(context).colorScheme.onPrimary,
            selectedBorderColor: Theme.of(context).colorScheme.primary,
            fillColor: Theme.of(context).colorScheme.primary,
            color: Theme.of(context).colorScheme.primary,
            isSelected: _selectedLanguage,
            children: [
              LanguageFlag('en-us'),
              LanguageFlag('fr'),
            ],
          ),
        ],
      ),
    );
  }
}

class LanguageFlag extends StatelessWidget {
  const LanguageFlag(
    this.language, {
    super.key,
  });

  final String language;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: CountryFlag.fromLanguageCode(
        language,
        shape: const RoundedRectangle(6.0),
        width: 50,
        height: 40,
      ),
    );
  }
}

class SwitchDomain extends StatefulWidget {
  const SwitchDomain({super.key});

  @override
  State<SwitchDomain> createState() => _SwitchDomainState();
}

class _SwitchDomainState extends State<SwitchDomain> {
  List<String> domains = [];
  final _selectedDomain = TextEditingController();

  Future<void> _loadDomains() async {
    final tmp = await getAPIDomainList();
    final domain = await getAPIDomain();
    if (tmp == null) {
      return;
    }
    setState(() {
      domains = tmp;
      _selectedDomain.text = domain ?? '';
    });
  }

  Future<void> _setDomain({String? domain}) async {
    if (domain != null) {
      _onChanged(domain);
    }
    await setAPIDomain(_selectedDomain.text);
  }

  void _onChanged(String domain) {
    setState(() => _selectedDomain.text = domain);
  }

  @override
  void initState() {
    super.initState();
    _loadDomains();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10.0, horizontal: 20.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                AreaText(
                  AppLocalizations.of(context)!.changeServerHost,
                  fontWeight: FontWeight.w800,
                  color: Theme.of(context).colorScheme.onSurface,
                  textAlign: TextAlign.start,
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: TypeAheadField(
                    decorationBuilder: (context, child) => Card(
                      color: Theme.of(context).colorScheme.primary,
                      child: child,
                    ),
                    emptyBuilder: (context) => Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: AreaText(
                          AppLocalizations.of(context)!.noSuggestionsFound),
                    ),
                    builder: (context, controller, focusNode) => TextField(
                      controller: controller,
                      focusNode: focusNode,
                      cursorColor: Theme.of(context).colorScheme.onSurface,
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.onSurface,
                      ),
                      onSubmitted: (domain) async {
                        await _setDomain(domain: domain);
                      },
                      onChanged: _onChanged,
                      decoration: InputDecoration(
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.all(
                            Radius.circular(12.0),
                          ),
                          borderSide: BorderSide(
                            color: Theme.of(context).colorScheme.onSurface,
                          ),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.all(
                            Radius.circular(12.0),
                          ),
                          borderSide: BorderSide(
                            color: Theme.of(context).colorScheme.onSurface,
                          ),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.all(
                            Radius.circular(12.0),
                          ),
                          borderSide: BorderSide(
                            width: 2.0,
                            color: Theme.of(context).colorScheme.onSurface,
                          ),
                        ),
                        contentPadding: const EdgeInsets.only(left: 18.0),
                        labelText: AppLocalizations.of(context)!.host,
                        labelStyle: TextStyle(
                          color: Theme.of(context).colorScheme.onSurface,
                        ),
                        suffixIcon: IconButton(
                          onPressed: _setDomain,
                          icon: Icon(
                            Icons.check,
                            color: Theme.of(context).colorScheme.onSurface,
                          ),
                          tooltip: AppLocalizations.of(context)!.validate,
                        ),
                      ),
                    ),
                    controller: _selectedDomain,
                    itemBuilder: (context, domain) => Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: AreaText(
                        domain,
                        selectable: false,
                        color: Theme.of(context).colorScheme.onPrimary,
                        textAlign: TextAlign.start,
                      ),
                    ),
                    onSelected: _onChanged,
                    suggestionsCallback: (domain) => domains
                        .where((dom) =>
                            dom.toLowerCase().contains(domain.toLowerCase()))
                        .toList(),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

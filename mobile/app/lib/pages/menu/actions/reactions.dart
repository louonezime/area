import 'package:area/components/ActionCard.dart';
import 'package:area/components/AreaAppBar.dart';
import 'package:area/components/AreaConnectionForm.dart';
import 'package:area/components/AreaScaffold.dart';
import 'package:area/components/AreaSearchBar.dart';
import 'package:area/components/AreaText.dart';
import 'package:area/components/AreaTitle.dart';
import 'package:area/components/MenuDrawer.dart';
import 'package:area/utils/area.dart';
import 'package:area/utils/string.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class ReactionsPage extends StatelessWidget {
  ReactionsPage({
    super.key,
    required this.id,
    required this.service,
  });

  final String id;
  final AreaService service;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    return AreaScaffold(
      scaffoldKey: _scaffoldKey,
      appBar: AreaAppBar(scaffoldKey: _scaffoldKey),
      drawer: const NavDrawer(),
      child: MainPage(id: id, service: service),
    );
  }
}

class MainPage extends StatefulWidget {
  const MainPage({
    super.key,
    required this.id,
    required this.service,
  });

  final String id;
  final AreaService service;

  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  final TextEditingController _controller = TextEditingController();

  void searchReaction(String text) {
    setState(() => _controller.text = text);
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.only(top: 50.0, bottom: 20.0),
        child: Column(
          children: [
            AreaTitle(title: widget.service.name.formatNameTitle()),
            AreaSearchBar(
              onChanged: searchReaction,
              controller: _controller,
              itemBuilder: (context, suggestion) => ListTile(
                title: AreaText(
                  suggestion.title,
                  selectable: false,
                  textAlign: TextAlign.start,
                  color: Theme.of(context).colorScheme.onSurface,
                ),
              ),
              onSuggestionSelected: (suggestion) {
                searchReaction(suggestion.title);
              },
              suggestionsCallback: (pattern) => widget.service.reactions
                  .where((reaction) => reaction.title
                      .toLowerCase()
                      .contains(pattern.toLowerCase()))
                  .toList(),
            ),
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: GridView.count(
                primary: false,
                mainAxisSpacing: 12.0,
                crossAxisSpacing: 12.0,
                crossAxisCount: MediaQuery.of(context).size.width > 680 ? 4 : 2,
                shrinkWrap: true,
                children: widget.service.reactions
                    .where(
                      (reaction) => reaction.title.toLowerCase().contains(
                          _controller.text.isEmpty
                              ? reaction.title.toLowerCase()
                              : _controller.text.toLowerCase()),
                    )
                    .map(
                      (reaction) => ActionCard(
                        reaction.title,
                        color: widget.service.color,
                        sharp: true,
                        onTap: () async {
                          final res = await showDialog(
                            context: context,
                            builder: (context) => AreaConnectionForm(
                              service: widget.service,
                              infos: reaction,
                            ),
                          ) as List<ActionForm>?;
                          if (context.mounted && res != null) {
                            reaction.form = res;
                            context.pop(reaction);
                          }
                        },
                      ),
                    )
                    .toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:area/components/AreaText.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:flutter_typeahead/flutter_typeahead.dart';

class AreaSearchBar<E> extends StatefulWidget {
  const AreaSearchBar({
    super.key,
    required this.onChanged,
    required this.controller,
    required this.itemBuilder,
    required this.onSuggestionSelected,
    required this.suggestionsCallback,
  });

  final void Function(String) onChanged;
  final TextEditingController controller;
  final Widget Function(BuildContext, E) itemBuilder;
  final void Function(E)? onSuggestionSelected;
  final List<E>? Function(String) suggestionsCallback;

  @override
  State<AreaSearchBar<E>> createState() => _AreaSearchBarState<E>();
}

class _AreaSearchBarState<E> extends State<AreaSearchBar<E>> {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: SizedBox(
        width: MediaQuery.of(context).size.width * 0.7,
        child: TypeAheadField<E>(
          emptyBuilder: (context) => Padding(
            padding: const EdgeInsets.all(8.0),
            child: AreaText(AppLocalizations.of(context)!.noSuggestionsFound),
          ),
          builder: (context, controller, focusNode) => TextField(
            controller: controller,
            focusNode: focusNode,
            cursorColor: Theme.of(context).colorScheme.onSurface,
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurface,
            ),
            onSubmitted: widget.onChanged,
            onChanged: widget.onChanged,
            decoration: InputDecoration(
              border: OutlineInputBorder(
                borderRadius: BorderRadius.all(
                  Radius.circular(9999.0),
                ),
                borderSide: BorderSide(
                  color: Theme.of(context).colorScheme.onSurface,
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.all(
                  Radius.circular(9999.0),
                ),
                borderSide: BorderSide(
                  color: Theme.of(context).colorScheme.onSurface,
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.all(
                  Radius.circular(9999.0),
                ),
                borderSide: BorderSide(
                  color: Theme.of(context).colorScheme.onSurface,
                ),
              ),
              contentPadding: const EdgeInsets.only(left: 18.0),
              labelText: AppLocalizations.of(context)!.search,
              labelStyle: TextStyle(
                color: Theme.of(context).colorScheme.onSurface,
              ),
              suffixIcon: IconButton(
                onPressed: () => widget.onChanged(''),
                icon: Icon(
                  Icons.close,
                  semanticLabel: AppLocalizations.of(context)!.delete,
                  color: Theme.of(context).colorScheme.onSurface,
                ),
              ),
            ),
          ),
          controller: widget.controller,
          itemBuilder: widget.itemBuilder,
          onSelected: widget.onSuggestionSelected,
          suggestionsCallback: widget.suggestionsCallback,
        ),
      ),
    );
  }
}

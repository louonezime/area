import 'dart:convert';
import 'dart:developer';
import 'dart:io';

import 'package:area/utils/http.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:html/parser.dart';
import 'package:webview_flutter/webview_flutter.dart';

Future<Map<String, dynamic>> parsePage(String page) async {
  final document = parse(page);
  final contentEncoded = parse(document.body!.text).documentElement!.text;
  final Map<String, dynamic> content = Platform.isIOS
      ? jsonDecode(contentEncoded)
      : jsonDecode(jsonDecode(contentEncoded));
  return content;
}

class RedirectPage extends StatefulWidget {
  const RedirectPage({
    super.key,
    required this.url,
    this.handleRedirection,
  });

  final String url;
  final Future<void> Function(BuildContext, String, String)? handleRedirection;

  @override
  State<RedirectPage> createState() => _RedirectPageState();
}

class _RedirectPageState extends State<RedirectPage> {
  Widget page = Scaffold(
    body: Center(
      child: CircularProgressIndicator(),
    ),
  );
  WebViewController _webViewController = WebViewController();
  Future<void> Function(BuildContext, String, String)? _handleRedirection;
  final Set<Factory<OneSequenceGestureRecognizer>> gestureRecognizers = {
    Factory(() => EagerGestureRecognizer())
  };

  Future<void> init() async {
    String? token = await storage.read(key: 'jwt');
    _webViewController = WebViewController()
      ..loadRequest(Uri.parse(widget.url), headers: {
        'Authorization': 'Bearer $token',
      })
      ..enableZoom(true)
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setUserAgent('random')
      ..setOnConsoleMessage(
        (message) => log('${widget.url}: ${message.message}'),
      )
      ..enableZoom(true);
    _webViewController.setNavigationDelegate(
      NavigationDelegate(
        onHttpError: (err) {
          log('Http error (code ${err.response?.statusCode}): ${err.request?.uri.toString()}',
              time: DateTime.now());
        },
        onPageFinished: (url) async {
          if (_handleRedirection != null) {
            final content =
                (await _webViewController.runJavaScriptReturningResult(
                        'document.documentElement.innerHTML'))
                    .toString()
                    .replaceAll('\\u003C', '<');
            if (context.mounted) {
              await _handleRedirection!(context, url, content);
            }
          }
        },
      ),
    );
    setState(() {
      page = SafeArea(
        child: Scaffold(
          body: SizedBox(
            height: MediaQuery.of(context).size.height,
            child: WebViewWidget(
              key: UniqueKey(),
              controller: _webViewController,
              gestureRecognizers: gestureRecognizers,
            ),
          ),
        ),
      );
    });
  }

  @override
  void initState() {
    super.initState();
    _handleRedirection = widget.handleRedirection;
    init();
  }

  @override
  void dispose() {
    _handleRedirection = null;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return page;
  }
}

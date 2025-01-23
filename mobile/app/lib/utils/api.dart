import 'dart:convert';
import 'dart:developer';

import 'package:area/utils/http.dart';
import 'package:flutter/services.dart';

class APIEndpoint {
  const APIEndpoint({
    required this.name,
    required this.path,
  });

  final String name;
  final String path;

  factory APIEndpoint.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'name': String name,
        'path': String path,
      } =>
        APIEndpoint(
          name: name,
          path: path,
        ),
      _ => throw const FormatException('Failed to load API endpoint'),
    };
  }
}

class APIRoutes {
  const APIRoutes({
    required this.domains,
    required this.endpoints,
  });

  final List<String> domains;
  final List<APIEndpoint> endpoints;

  factory APIRoutes.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'domains': List<dynamic> domains,
        'endpoints': List<dynamic> endpoints,
      } =>
        APIRoutes(
          domains: domains.map((domain) => domain.toString()).toList(),
          endpoints: endpoints.map((ep) => APIEndpoint.fromJson(ep)).toList(),
        ),
      _ => throw const FormatException('Failed to load API routes'),
    };
  }
}

class APIToken {
  const APIToken({
    required this.accessToken,
  });

  final String accessToken;

  factory APIToken.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {
        'access_token': String accessToken,
      } =>
        APIToken(accessToken: accessToken),
      _ => throw const FormatException('Failed to load API token'),
    };
  }
}

Future<APIRoutes> _readJsonFromFile(String filepath) async {
  final res = await rootBundle.loadString(filepath);
  return APIRoutes.fromJson(jsonDecode(res) as Map<String, dynamic>);
}

Future<List<String>?> getAPIDomainList() async {
  try {
    final content = await _readJsonFromFile('assets/api_routes.json');
    return content.domains
        .map((domain) => domain.endsWith('/')
            ? domain.substring(0, domain.length - 1)
            : domain)
        .toList();
  } catch (err) {
    log('getAPIDomainList: ${err.toString()}', time: DateTime.now());
  }
  return null;
}

String getHostFromDomain(String domain) => (domain.startsWith('https')
        ? domain.replaceFirst('https://', '')
        : domain.replaceFirst('http://', ''))
    .replaceFirst(':8080', '');

Future<String?> getAPIDomain() async {
  String? domain = await storage.read(key: 'domain');
  if (domain != null) {
    return domain;
  }
  try {
    final domains = await getAPIDomainList();
    if (domains == null) {
      return null;
    }
    if (domains.isEmpty) {
      log('getAPIDomain: Domains list is empty', time: DateTime.now());
      return null;
    }
    return domains[0];
  } catch (err) {
    log('getAPIDomain: ${err.toString()}', time: DateTime.now());
  }
  return null;
}

Future<void> setAPIDomain(String domain) async {
  await storage.write(key: 'domain', value: domain);
}

Future<String?> getAPIEndpointPath(
  String endpoint, {
  List<String>? dynamicRoutes,
}) async {
  try {
    final content = await _readJsonFromFile('assets/api_routes.json');
    String? path =
        content.endpoints.where((ep) => ep.name == endpoint).firstOrNull?.path;
    if (path != null && path.contains('%') && dynamicRoutes != null) {
      for (final route in dynamicRoutes) {
        path = path!.replaceFirst('%', route);
      }
    }
    return path;
  } catch (err) {
    log(err.toString(), time: DateTime.now());
  }
  return null;
}

Future<String?> getAPIPath(
  String endpoint, {
  List<String>? dynamicRoutes,
}) async {
  final domain = await getAPIDomain();
  final endpointPath =
      await getAPIEndpointPath(endpoint, dynamicRoutes: dynamicRoutes);
  return domain == null || endpointPath == null ? null : domain + endpointPath;
}

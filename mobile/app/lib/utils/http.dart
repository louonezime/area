import 'dart:convert';
import 'dart:developer';

import 'package:area/utils/api.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;

class Error400 implements Exception {
  const Error400(this.message);

  final String message;

  @override
  String toString() {
    return 'Error400: $message';
  }
}

class Error401 implements Exception {
  const Error401(this.message);

  final String message;

  @override
  String toString() {
    return 'Error401: $message';
  }
}

class Error409 implements Exception {
  const Error409(this.message);

  final String message;

  @override
  String toString() {
    return 'Error409: $message';
  }
}

class Error500 implements Exception {
  const Error500(this.message);

  final String message;

  @override
  String toString() {
    return 'Error500: $message';
  }
}

final storage = FlutterSecureStorage();

Future<bool> isConnected() async => await storage.containsKey(key: 'jwt');

Future<void> logout() async => await storage.delete(key: 'jwt');

Future<void> login(String token) async =>
    await storage.write(key: 'jwt', value: token);

/// API GET data
Future<String> fetchData(
  BuildContext context,
  String endpoint, {
  bool redirectOnError = true,
  Map<String, String>? params,
  Map<String, String>? headers,
}) async {
  String? token = await storage.read(key: 'jwt');
  String? domain = await getAPIDomain();

  if (domain == null) {
    throw Error500("Couldn't fetch data: No domain to call API given.");
  }
  final query = params?.entries
      .map((param) =>
          '${Uri.encodeComponent(param.key)}=${Uri.encodeComponent(param.value)}')
      .join('&');
  final uri = Uri.parse(domain + endpoint + (query == null ? '' : '?$query'));
  final headersList = {
    'Authorization': 'Bearer $token',
    'Content-Type': 'application/json',
  };
  if (headers != null) {
    headersList.addAll(headers);
  }
  log('GET $uri', time: DateTime.now());
  final res = await http.get(
    uri,
    headers: headersList,
  );

  switch (res.statusCode) {
    case 200:
      return res.body;
    case 201:
      return res.body;
    case 400:
      throw Error400(res.reasonPhrase ?? 'Password is too short.');
    case 401:
      if (redirectOnError) {
        await storage.delete(key: 'jwt');
        if (context.mounted) {
          context.goNamed('/login');
        }
      }
      throw Error401(res.reasonPhrase ?? 'Unauthorized');
    case 409:
      throw Error409(res.reasonPhrase ?? 'Email already in use.');
    default:
      throw Error500("Couldn't fetch data: ${res.reasonPhrase}");
  }
}

/// API POST data
Future<String> postData(
  BuildContext context,
  String endpoint, {
  Map<String, dynamic>? body,
  Map<String, dynamic>? params,
  bool useToken = true,
  bool redirectOnError = true,
}) async {
  String? token = useToken ? await storage.read(key: 'jwt') : null;
  String? domain = await getAPIDomain();

  if (domain == null) {
    throw Error500("Couldn't post data: No domain to call API given.");
  }

  final query = params?.entries
      .map((param) =>
          '${Uri.encodeComponent(param.key)}=${Uri.encodeComponent(param.value)}')
      .join('&');
  final uri = Uri.parse(domain + endpoint + (query == null ? '' : '?$query'));
  log('POST $uri', time: DateTime.now());
  final res = await http.post(
    uri,
    headers: {
      if (useToken) 'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
    },
    body: body == null ? null : json.encode(body),
  );

  switch (res.statusCode) {
    case 200:
      return res.body;
    case 201:
      return res.body;
    case 400:
      throw Error400(res.reasonPhrase ?? 'Password is too short.');
    case 401:
      if (redirectOnError) {
        await storage.delete(key: 'jwt');
        if (context.mounted) {
          context.goNamed('/login');
        }
      }
      throw Error401(res.reasonPhrase ?? 'Unauthorized');
    case 409:
      throw Error409(res.reasonPhrase ?? 'Email already in use.');
    default:
      throw Error500("Couldn't post data: ${res.reasonPhrase}");
  }
}

/// Delete API data
Future<void> deleteData(
  BuildContext context,
  String endpoint, {
  bool redirectOnError = true,
  Map<String, dynamic>? body,
  Map<String, String>? params,
  Map<String, String>? headers,
}) async {
  String? token = await storage.read(key: 'jwt');
  String? domain = await getAPIDomain();

  if (domain == null) {
    throw Error500("Couldn't delete data: No domain to call API given.");
  }
  final query = params?.entries
      .map((param) =>
          '${Uri.encodeComponent(param.key)}=${Uri.encodeComponent(param.value)}')
      .join('&');
  final uri = Uri.parse(domain + endpoint + (query == null ? '' : '?$query'));
  final headersList = {
    'Authorization': 'Bearer $token',
    'Content-Type': 'application/json',
  };
  if (headers != null) {
    headersList.addAll(headers);
  }
  log('DELETE $uri', time: DateTime.now());
  final res = await http.delete(
    uri,
    headers: headersList,
    body: body == null ? null : json.encode(body),
  );

  switch (res.statusCode) {
    case 200:
      return;
    case 201:
      return;
    case 401:
      if (redirectOnError) {
        await storage.delete(key: 'jwt');
        if (context.mounted) {
          context.goNamed('/login');
        }
      }
      throw Error401(res.reasonPhrase ?? 'Unauthorized');
    default:
      throw Error500("Couldn't delete data: ${res.reasonPhrase}");
  }
}

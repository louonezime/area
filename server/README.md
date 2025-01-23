# Application Server API Reference

Base url: `http://localhost:8080/`

### Introduction

The API uses standard HTTP methods (such as `GET`, `POST`, `PATCH`, and `DELETE`) to send requests and receive responses. It expects JSON-encoded request bodies and returns JSON-encoded responses, accompanied by appropriate HTTP status codes.

| Method   | Description                              |
| -------- | ---------------------------------------- |
| `GET`    | Used to retrieve a single item or a collection of items. |
| `POST`   | Used when creating new items e.g. a new user, post, comment etc. |
| `PATCH`  | Used to update one or more fields on an item e.g. update e-mail of user. |
| `DELETE` | Used to delete an item.                  |

In this documentation, you'll find detailed information about available endpoints, required parameters, and sample code snippets to help.<br/>
For more informations about the route, please refer to the Swagger.

```http://localhost:8080/docs```

### API Routes

| Method   | URL                                      | Description                              |
| -------- | ---------------------------------------- | ---------------------------------------- |
| `GET` | `/about.json` | Informations on the application server.
| `POST` | `/auth/register` | User registration without a service.
| `POST` | `/oauth/login` | User login without a service.
| `GET` | `/oauth/{provider}/init` | Recover OAuth2 provider URL for authentication. |
| `GET` | `/oauth/{provider}/callback` | Callback to register/login a user connexion with a provider.
| `GET` | `/user` | Get current user profile.
| `PATCH` | `/user/update` | Update profile information.
| `GET` | `/service/list` | Lists implemented services.
| `GET` | `/service/myList` | Lists user's authenticated services.
| `GET` | `/service/{serviceName}/oauth/callback` | Callback redirection from OAuth2 provider that retrieves the code from query directly.
| `GET` | `/service/{serviceName}/oauth/callback/code-add` | Add a secure oauth connection; linking an authenticated service on your account.
| `POST` | `/service/{serviceName}/add-api-key` | Add an api key to a service.
| `POST` | `/service/{serviceName}/register-normal` | Add a service that has no form of authentication required.
| `GET` | `/service/{serviceId}` | Fetches a service by its ID.
| `DELETE` | `/service/{serviceName}` | Deletes/removes a service.
| `GET` | `/service/{serviceName}/actions` | Lists service's implemented actions.
| `GET` | `/service/{serviceName}/reactions` | Lists service's implemented reactions.
| `GET` | `/service/{serviceName}/refresh` | Refresh service's auth token.
| `POST` | `/area` | Creates an Action REAction.
| `DELETE` | `/area/{id}` | Deletes an AREA.
| `GET` | `/area/list` | Lists AREAs created by the authenticated user.
| `GET` | `/area/actions/{id}` | Recover the AREA's action.
| `GET` | `/area/reactions/{id}` | Recover the AREA's reaction.

## Authentication

One of the most essential parts of an API is authentication.

| Header key        | Description                              |
| ----------------- | ---------------------------------------- |
| `Authorization`   | The authorized user’s bearer token. This is used to gain access to protected endpoint. |

## 3rd Party Authentication

The API supports various authentication configurations for 3rd-party services, including API keys, OAuth2, and Webhooks.

### Authentication Configurations

API Key (ApiKeyConfig): Uses an API key for authentication.

```
type: "apiKey"
testValidity: Function to validate the API key.
hint: Optional hint for the API key format.
```

OAuth2 (OAuthConfig): Uses OAuth2 for access tokens and refresh tokens.

```
type: "oauth2"
authorization: Function to initiate the authorization flow.
retrieveToken: Function to exchange authorization code for tokens.
refreshToken: Function to refresh access tokens.
```

No Authentication (NoAuthConfig): No authentication required.

```
type: null
```

Webhooks (WebHookConfig): Uses webhooks to trigger actions.
```
type: "webhook"
```

These configurations are unified under the AuthConfig type.

### Actions and Reactions

#### Action

An Action is a trigger within the service.

`title`: Display title of the action.

`name`: Identifier of the action.

`description`: Action's purpose or trigger condition.

`form`: Configuration fields required to execute the action.

`trigger`: `request`: Function to trigger action.

`trigger`: `condition`: Evaluates whether the action should trigger based on state changes.

#### Reaction

A Reaction executes when an action’s trigger condition is met.

`title`: Display title of the reaction.

`name`: Identifier of the reaction.

`description`: Reaction’s purpose.

`form`: Fields to configure the reaction.

`request`: `request`: Function to execute the reaction.

### Example Services

Example services include:

Date and Time: Triggers actions like daily and weekly reminders.

Discord: Triggers reactions such as sending messages in channels.

Dropbox: Triggers on new files and supports file uploads.

GitHub and GitLab: Triggers for events like new issues or pull requests.

Slack and Twitch: Triggers for messages and chat-related reactions.

Each service may support different combinations of actions and reactions to accommodate specific use cases, such as event tracking, messaging, and file management.

## HTTP Response Status Codes

One of the most important things in an API is how it returns response codes. Each response code means a different thing and consumers of your API rely heavily on these codes.

| Code  | Title                     | Description                              |
| ----- | ------------------------- | ---------------------------------------- |
| `200` | `OK`                      | When a request was successfully processed (e.g. when using `GET`, `PATCH`, `PUT` or `DELETE`). |
| `201` | `Created`                 | Every time a record has been added to the database (e.g. when creating a new user or post). |
| `400` | `Bad request`             | When the request could not be understood (e.g. invalid syntax). |
| `401` | `Unauthorized`            | When authentication failed. |
| `403` | `Forbidden`               | When an authenticated user is trying to perform an action, which he/she does not have permission to. |
| `404` | `Not found`               | When URL or entity is not found. |
| `500` | `Internal server error`   | When an internal error has happened (e.g. when trying to add/update records in the database fails). |
| `502` | `Bad Gateway`             | When a necessary third party service is down. |

## Response

### Errors

When errors occur the consumer will get a JSON payload verifying that an error occurred together with a reason for why the error occurred.

| Key        | Description                              |
| ---------- | ---------------------------------------- |
| `statusCode`     | The HTTP code.                           |
| `timestamp`    | Time of error when requesting.  |
| `path`  | Path of request where error occured. |
| `message` | Error message. |
| `errors?` | Any custom errors that might be included. |

## Examples

#### An error response

```json
{
  "statusCode": 401,
  "timestamp": "2024-10-29T13:23:43.741Z",
  "path": "/service/list",
  "message": "Unauthorized",
}
```

#### A detailed error response

```json
{
    "statusCode": 400,
    "timestamp": "2024-10-29T13:32:59.328Z",
    "path": "/auth/register",
    "message": "Data validation failed",
    "errors": [
        {
            "path": "email",
            "message": "Invalid email address format"
        }
    ]
}
```

## Data Retrieval

#### A single item

```json
{
    "id": 1,
    "name": "Shane Berry",
    "email": "shane@berry.com"
    "created_at": "2015-03-02T12:59:02+0100",
    "updated_at": "2015-03-04T15:50:40+0100"
}
```

#### An endpoint without meaningful data to return

```json
{
    "success": "true"
}
```

#### A collection of items

```json
[
    {
        "id": 1,
        "name": "Shane Berry",
        "email": "shane@berry.com"
        "created_at": "2015-03-02T12:59:02+0100",
        "updated_at": "2015-03-04T15:50:40+0100"
    },
    {
        "id": 2,
        "name": "Albert Henderson",
        "email": "albert@henderson.com"
        "created_at": "2015-03-02T12:59:02+0100",
        "updated_at": "2015-03-04T15:50:40+0100"
    },
    {
        "id": 3,
        "name": "Miguel Phillips",
        "email": "miguel@phillips.com"
        "created_at": "2015-03-02T12:59:02+0100",
        "updated_at": "2015-03-04T15:50:40+0100"
    }
]
```

## Service Actions and Reactions

The Application Server API supports various actions and reactions for linked services, facilitating automation between services. Here are examples for each supported service:

### Google

Actions: `fetch_youtube_channel_info`, `check_for_new_emails`

Reactions: `update_user_bio`, `send_email`

### GitHub

Actions: `joined_organization`

Reactions: `update_bio`

### Slack

Reactions: `send_message`

For each service, actions and reactions enable users to connect and automate workflows by linking triggers and outcomes across different services.

### Example Service Data Structure

Here’s an example of a response showing available services and their actions and reactions:

```json
{
  "client": {
    "host": "127.0.0.1"
  },
  "server": {
    "current_time": 1730669152,
    "services": [
      {
        "name": "google",
        "actions": [
          {
            "name": "fetch_youtube_channel_info",
            "description": "Retrieve YouTube channel information for the user."
          },
          {
            "name": "check_for_new_emails",
            "description": "Fetch unread emails from Gmail."
          }
        ],
        "reactions": [
          {
            "name": "send_email",
            "description": "Send an email using Gmail."
          }
        ]
      },
      {
        "name": "slack",
        "actions": [],
        "reactions": [
          {
            "name": "send_message",
            "description": "Send a message to a Slack channel."
          }
        ]
      }
    ]
  }
}
```

## Architecture Overview

The server architecture is modular, with support for dynamic integrations through `ServiceConfig` objects. Each service is configured with actions, reactions, and authentication requirements.

`ServiceConfig` defines service properties, such as:

`name`: Service name.
`color`: UI color representation.
`auth`: Authentication configuration (AuthConfig).
`actions`: Array of Action objects.
`reactions`: Array of Reaction objects.

Authentication configurations include ApiKeyConfig, OAuthConfig,  NoAuthConfig, and WebHookConfig for versatile integrations with third-party services, ensuring flexibility in how different service APIs handle security and access.

### Authentication Flow

OAuth services initiate with authorization and manage tokens through retrieveToken and refreshToken.


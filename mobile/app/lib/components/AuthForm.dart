import 'package:area/components/AreaConnectionForm.dart';
import 'package:area/components/AreaText.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';
import 'package:form_validator/form_validator.dart';

class AuthForm extends StatefulWidget {
  const AuthForm({
    super.key,
    required GlobalKey<FormState> formKey,
    required this.onSubmit,
    this.confirmPassword = false,
    this.buttonText,
  }) : _formKey = formKey;

  final GlobalKey<FormState> _formKey;
  final Future<void> Function(String, String) onSubmit;
  final bool confirmPassword;
  final String? buttonText;

  @override
  State<AuthForm> createState() => _AuthFormState();
}

class _AuthFormState extends State<AuthForm> {
  bool hidePassword = true;
  bool hideConfirmPassword = true;
  bool isLoading = false;

  @override
  Widget build(BuildContext context) {
    String? email;
    String? password;

    return Padding(
      padding: const EdgeInsets.only(top: 25.0),
      child: Form(
        key: widget._formKey,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: FormInput(
                onSaved: (value) => email = value,
                color: Theme.of(context).colorScheme.onSurface,
                keyboardType: TextInputType.emailAddress,
                labelText: AppLocalizations.of(context)!.email, // 'Email'
                validator: ValidationBuilder(
                  requiredMessage: AppLocalizations.of(context)!
                      .pleaseEnterAnEmail, // 'Please enter an email address'
                )
                    .email(
                      AppLocalizations.of(context)!
                          .pleaseEnterAValidEmail, // 'Please enter a valid email address'
                    )
                    .build(),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: FormInput(
                onSaved: (value) => password = value,
                color: Theme.of(context).colorScheme.onSurface,
                hideText: hidePassword,
                labelText: AppLocalizations.of(context)!.password, // 'Password'
                suffixIcon: IconButton(
                  onPressed: () => setState(() {
                    hidePassword = !hidePassword;
                  }),
                  icon: Icon(
                    hidePassword ? Icons.visibility : Icons.visibility_off,
                    color: Theme.of(context).colorScheme.onSurface,
                  ),
                ),
                validator: ValidationBuilder(
                  requiredMessage: AppLocalizations.of(context)!
                      .pleaseEnterYourPassword, // 'Please enter your password'
                ).required().build(),
              ),
            ),
            if (widget.confirmPassword)
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: FormInput(
                  hideText: hideConfirmPassword,
                  color: Theme.of(context).colorScheme.onSurface,
                  labelText: AppLocalizations.of(context)!
                      .confirmPassword, // 'Confirm password'
                  suffixIcon: IconButton(
                    onPressed: () => setState(() {
                      hideConfirmPassword = !hideConfirmPassword;
                    }),
                    icon: Icon(
                      hideConfirmPassword
                          ? Icons.visibility
                          : Icons.visibility_off,
                      color: Theme.of(context).colorScheme.onSurface,
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return AppLocalizations.of(context)!
                          .pleaseConfirmYourPassword; // 'Please confirm your password'
                    }
                    if (value != password) {
                      return AppLocalizations.of(context)!
                          .passwordsDontMatch; // "Passwords don't match"
                    }
                    return null;
                  },
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: ElevatedButton(
                style: ButtonStyle(
                  backgroundColor: WidgetStatePropertyAll(
                    Theme.of(context).colorScheme.primary,
                  ),
                  padding: const WidgetStatePropertyAll(
                    EdgeInsets.all(10.0),
                  ),
                  minimumSize: const WidgetStatePropertyAll(
                    Size.fromHeight(72.0),
                  ),
                ),
                onPressed: isLoading
                    ? null
                    : () async {
                        widget._formKey.currentState!.save();
                        if (widget._formKey.currentState!.validate()) {
                          setState(() => isLoading = true);
                          await widget.onSubmit(email!, password!);
                          isLoading = false;
                        }
                      },
                child: isLoading
                    ? CircularProgressIndicator(
                        color: Theme.of(context).colorScheme.onPrimary,
                      )
                    : AreaText(
                        widget.buttonText ??
                            AppLocalizations.of(context)!
                                .getStarted, // 'Get started'
                        selectable: false,
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

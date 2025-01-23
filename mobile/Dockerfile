FROM ghcr.io/cirruslabs/flutter:stable

WORKDIR /app/mobile

# Install packages
COPY ./app/pubspec.* ./
RUN flutter clean && flutter pub get && flutter pub upgrade

# Create Android APK
COPY ./app ./
RUN flutter packages get && flutter packages upgrade
RUN flutter build apk --release

# Copy binary to root
# RUN mkdir -p ../web
# RUN cp ./build/app/outputs/flutter-apk/app-release.apk ../web/client.apk
# RUN cp ./build/app/outputs/flutter-apk/app-release.apk ./client.apk

RUN mkdir -p /app/mobile/build/app/apk-mobile && \
    cp ./build/app/outputs/flutter-apk/app-release.apk /app/mobile/build/app/apk-mobile/client.apk
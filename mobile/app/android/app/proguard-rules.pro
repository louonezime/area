# Keep errorprone annotations
-keep class com.google.errorprone.annotations.** { *; }

# Keep javax annotations
-keep class javax.annotation.** { *; }

# Keep concurrent annotations
-keep class javax.annotation.concurrent.** { *; }

# Keep google.crypto.tink related classes
-keep class com.google.crypto.tink.** { *; }

# Suppress warnings for missing errorprone and javax annotations
-dontwarn com.google.errorprone.annotations.CanIgnoreReturnValue
-dontwarn com.google.errorprone.annotations.CheckReturnValue
-dontwarn com.google.errorprone.annotations.Immutable
-dontwarn com.google.errorprone.annotations.RestrictedApi
-dontwarn javax.annotation.Nullable
-dontwarn javax.annotation.concurrent.GuardedBy

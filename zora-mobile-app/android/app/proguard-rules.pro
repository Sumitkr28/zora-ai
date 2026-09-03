# Project-specific R8 / ProGuard rules for the release build.
#
# Capacitor, Firebase and AndroidX all ship their own consumer rules, so only the
# cases below need stating here.

# ── Unused auth providers ──────────────────────────────────────────────────────
# @capacitor-firebase/authentication compiles a handler for every provider it
# supports. variables.gradle sets rgcfaIncludeFacebook = false (this app signs in
# with Google and email only), so the Facebook SDK is not on the classpath — but
# FacebookAuthProviderHandler still references it, and R8 fails the build on the
# dangling references:
#
#   ERROR: R8: Missing class com.facebook.CallbackManager$Factory
#          (referenced from FacebookAuthProviderHandler)
#
# The handler is never instantiated, so the references are unreachable at runtime
# and safe to ignore. Remove this if Facebook sign-in is ever enabled.
-dontwarn com.facebook.**

# ── WebView bridge ─────────────────────────────────────────────────────────────
# Capacitor calls into these from JavaScript by name via @JavascriptInterface.
# Its own consumer rules cover the bridge, but keeping the annotated members
# explicit means an aggressive future R8 version cannot rename them out from
# under the WebView.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep line numbers so Play Console crash reports stay readable after
# deobfuscation with the mapping file.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

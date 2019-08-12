#/bin/bash
rm app.apk
ionic cordova platform rm android
ionic cordova platform add android
ionic cordova prepare android

# 
ionic cordova build android --release
echo build success ...
#
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ./baan.delivery.keystore -storepass long97 ./platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk baan.delivery
echo jarsigner success ...
#
zipalign -v 4 ./platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk app.apk
echo zipalign success ...
#
apksigner verify app.apk
echo apksigner success ...


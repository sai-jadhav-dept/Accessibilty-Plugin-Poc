rem Check if HOPE.apk exists and delete it if it does

if exist Accessibility.apk (

    del Accessibility.apk

)

cd android

call ./gradlew clean

call ./gradlew assembleRelease

cd app\build\outputs\apk\release

 

ren app-release.apk Accessibility.apk

move Accessibility.apk ..\..\..\..\..\..

cd ..\..\..\..
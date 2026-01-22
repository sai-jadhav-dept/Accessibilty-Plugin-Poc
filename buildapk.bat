rem Check if HOPE.apk exists and delete it if it does

if exist HOPE.apk (

    del HOPE.apk

)

cd android

call ./gradlew clean

call ./gradlew assembleRelease

cd app\build\outputs\apk\release

 

ren app-release.apk HOPE.apk

move HOPE.apk ..\..\..\..\..\..

cd ..\..\..\..
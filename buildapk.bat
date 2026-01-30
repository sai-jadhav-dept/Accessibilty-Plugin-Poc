rem Check if HOPE.apk exists and delete it if it does

if exist poc.apk (

    del poc.apk

)

cd android

call ./gradlew clean

call ./gradlew assembleRelease

cd app\build\outputs\apk\release

 

ren app-release.apk poc.apk

move poc.apk ..\..\..\..\..\..

cd ..\..\..\..

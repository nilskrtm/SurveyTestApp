![Build](https://github.com/nilskrtm/SurveyTestApp/actions/workflows/push.yml/badge.svg)

# Survey App

This repository is part of a hobby project for creating, managing, conducting and evaluating surveys.<br/>
The surveys can be managed in a WebApp and are carried out in the [(Android) app](https://github.com/nilskrtm/SurveyTestApp) on tablets, for example. There, a survey runs in a kiosk mode. This allows these devices to be displayed in service outlets, trade fairs or other locations, allowing you to gather customer satisfaction through a simple survey.<br/>
For the questions, there is no answer option in text form, but only through images, which should be selected to match the corresponding answer option.

The project also involves the following two repositories:

- [Survey Backend](https://github.com/nilskrtm/survey-test-api)
- [Survey Web](https://github.com/nilskrtm/survey-test-web)

> This whole project is still a _WIP_ and there are still some [improvements](#todos-and-improvements) I want to make but haven't had the time yet.

## Overview

<b>This module</b> represents the <b>(Android-) app</b> of the system in the form of a <b>React Native</b> app. Web requests are sent to the Rest API to gather required data of surveys and to save votes in the database.

## Configuration

There is no special configuration needed to build or run the app. The only configuration is done by the user in the app, after installation. The settings are self-explanatory.

## Building the App

Set gradle properties for the release key to use:

> see https://reactnative.dev/docs/signed-apk-android#generating-an-upload-key

| Property                   | Description                 |
|:---------------------------|:----------------------------|
| APP_RELEASE_STORE_FILE     | path to release key         |
| APP_RELEASE_STORE_PASSWORD | password of release key     |
| APP_RELEASE_KEY_ALIAS      | alias of release key        |
| APP_RELEASE_KEY_PASSWORD   | password of the release key |

And build the apk:

```bash
cd android
./gradlew assembleRelease
```

The generated .apk-File can than be installed on the desired device.

## Todos and Improvements

> In general, the app is the oldest component of the project and I have only recently converted it properly to Typescript. It works, but it is nevertheless still necessary to look for 'bad code' in some places and make appropriate changes.

- the queue for synchronizing the votes is rather poorly implemented, in the best case this work should be converted into a native Android component so that it runs properly in the background; the current state of its implementation is not necessarily React-friendly
- check the lock task setup (for the kiosk mode)
    - are there more features that should be disabled to be a 'real' kiosk mode?
- upgrade to eslint 9
- ...

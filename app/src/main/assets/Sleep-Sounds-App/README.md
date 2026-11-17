# Sleep Sounds & Relaxing Nature

A lightweight, offline-capable ambient sleep sound, mixer, sleep timer, and visual relaxation application built with HTML5, CSS3, Vanilla JavaScript (Web Audio API + HTML5 Audio fallback), and a native Android / Amazon Fire OS WebView host (`MainActivity.kt` + `FireOSBridge.kt`).

## Project Structure

```
app/src/main/assets/Sleep-Sounds-App/
├── index.html
├── style.css
├── script.js
├── translations.js
├── README.md
└── assets/
    ├── images/
    │   ├── night_forest.jpg
    │   ├── sunset_beach.jpg
    │   ├── rainy_window.svg
    │   ├── cozy_fireplace.jpg
    │   ├── starry_sky.jpg
    │   ├── forest_waterfall.svg
    │   └── misty_mountains.svg
    ├── icons/
    │   └── logo.svg
    └── audio/
        ├── rain/           (gentle_rain.wav, heavy_rain.wav, thunderstorm.wav)
        ├── ocean/          (ocean_waves.wav, flowing_river.wav, waterfall.wav)
        ├── forest/         (forest_ambience.wav, birds_singing.wav, wind_in_trees.wav)
        ├── white-noise/    (white_noise.wav, pink_noise.wav, brown_noise.wav, gentle_fan.wav, air_conditioner.wav, night_ambience.wav)
        ├── fireplace/      (fireplace.wav, crackling_fire.wav, cozy_cabin_rain.wav)
        └── meditation/     (tibetan_singing_bowls.wav, gentle_meditation.wav, zen_garden.wav, soft_ambient.wav)
```

## Asset Licensing

- **Audio Files (`assets/audio/**/*.wav`)**: 22 seamless-looping 22.05 kHz 16-bit PCM WAV recordings synthesized directly for this project with equal-power circular crossfades. Original project assets (CC0 / royalty-free for commercial distribution in the APK with no external attribution required).
- **Visual Assets (`assets/images/*`, `assets/icons/*`)**: Original bespoke illustrations and SVG vector scenes created for this application.

## Testing on a Computer (Desktop Browser)

To test Web Audio API buffer decoding and `fetch()` without local `file://` CORS restrictions, serve the web directory via any local static server:

```bash
cd app/src/main/assets/Sleep-Sounds-App
python3 -m http.server 8080
```

Open `http://localhost:8080` in Chrome, Edge, or Firefox:
- Use **Settings → Interface Layout** to toggle between **Fire TV (D-Pad 10-Foot UI)** and **Fire Tablet (Touch UI)**.
- Test **D-Pad navigation** with keyboard Arrow keys, Enter, and Escape/Backspace.
- Test **Multilingual & Arabic RTL** via **Settings → Interface Language**.

## Building an APK Compatible with Amazon Fire OS & Android

1. Ensure Android SDK (API 24+ minSdk, API 36 targetSdk) is configured.
2. Build a debug or signed release APK:
   ```bash
   gradle assembleDebug
   # or for release:
   gradle assembleRelease
   ```
3. The native Android host (`MainActivity.kt` & `FireOSBridge.kt`) provides:
   - Offline asset serving via `https://appassets.androidplatform.net/` (`AssetManager` interception) for full Web Audio API & `localStorage` support.
   - Native system language detection (`Locale.getDefault().toLanguageTag()`).
   - Automatic Fire TV vs Fire Tablet detection (`UiModeManager` + Leanback/touchscreen features).
   - Native `AudioManager` audio focus acquisition & interruption handling (`onNativeAudioFocusChange`).
   - Hardware Back button and TV Remote Media Key forwarding (`KEYCODE_MEDIA_PLAY_PAUSE`, `NEXT`, `PREVIOUS`, `STOP`).
   - `FLAG_KEEP_SCREEN_ON` support during Sleep Screen mode.

## Amazon Appstore Submission Checklist

- **Manifest**: `android.software.leanback` (`required="false"`) and `android.hardware.touchscreen` (`required="false"`) declared so a single APK targets both Fire TV and Fire Tablets.
- **TV Launcher**: `LEANBACK_LAUNCHER` intent-filter and `android:banner` configured.
- **Fire TV D-Pad**: No hover-only controls; visible focus rings on every interactive element; Back button never traps the user.
- **Offline Reliability**: All 22 audio files, 7 visual scenes, and translations are bundled inside the APK (`no network required`).
- **Privacy**: Zero personal data collection; preferences stored strictly on-device in `localStorage`.
- **Monetization Readiness**: Settings includes clean Free vs. planned Premium IAP architecture without intrusive ads during active sleep playback.

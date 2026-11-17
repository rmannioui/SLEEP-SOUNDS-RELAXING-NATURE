package com.example

import android.app.Activity
import android.app.UiModeManager
import android.content.Context
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.os.Build
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebView
import java.util.Locale

class FireOSBridge(
  private val activity: Activity,
  private val webViewProvider: () -> WebView?,
) {
  private val audioManager =
    activity.getSystemService(Context.AUDIO_SERVICE) as AudioManager

  private var focusRequest: AudioFocusRequest? = null

  private val focusChangeListener =
    AudioManager.OnAudioFocusChangeListener { focusChange ->
      val state =
        when (focusChange) {
          AudioManager.AUDIOFOCUS_GAIN -> "gain"
          AudioManager.AUDIOFOCUS_LOSS -> "loss"
          AudioManager.AUDIOFOCUS_LOSS_TRANSIENT -> "loss_transient"
          AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK -> "duck"
          else -> null
        }
      if (state != null) {
        activity.runOnUiThread {
          webViewProvider()?.evaluateJavascript(
            "window.onNativeAudioFocusChange && window.onNativeAudioFocusChange('$state');",
            null,
          )
        }
      }
    }

  @JavascriptInterface
  fun getDeviceLocale(): String {
    return Locale.getDefault().toLanguageTag()
  }

  @JavascriptInterface
  fun isTvDevice(): Boolean {
    val uiModeManager =
      activity.getSystemService(Context.UI_MODE_SERVICE) as? UiModeManager
    val isTvMode =
      uiModeManager?.currentModeType == Configuration.UI_MODE_TYPE_TELEVISION
    val hasLeanback =
      activity.packageManager.hasSystemFeature(PackageManager.FEATURE_LEANBACK)
    val hasTouch =
      activity.packageManager.hasSystemFeature(PackageManager.FEATURE_TOUCHSCREEN)
    return isTvMode || (hasLeanback && !hasTouch)
  }

  @JavascriptInterface
  fun requestAudioFocus(): Boolean {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val req =
        AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
          .setAudioAttributes(
            AudioAttributes.Builder()
              .setUsage(AudioAttributes.USAGE_MEDIA)
              .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
              .build()
          )
          .setOnAudioFocusChangeListener(focusChangeListener)
          .build()
      focusRequest = req
      audioManager.requestAudioFocus(req) == AudioManager.AUDIOFOCUS_REQUEST_GRANTED
    } else {
      @Suppress("DEPRECATION")
      audioManager.requestAudioFocus(
        focusChangeListener,
        AudioManager.STREAM_MUSIC,
        AudioManager.AUDIOFOCUS_GAIN,
      ) == AudioManager.AUDIOFOCUS_REQUEST_GRANTED
    }
  }

  @JavascriptInterface
  fun abandonAudioFocus() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      focusRequest?.let { audioManager.abandonAudioFocusRequest(it) }
      focusRequest = null
    } else {
      @Suppress("DEPRECATION")
      audioManager.abandonAudioFocus(focusChangeListener)
    }
  }

  @JavascriptInterface
  fun setKeepScreenOn(enabled: Boolean) {
    activity.runOnUiThread {
      if (enabled) {
        activity.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
      } else {
        activity.window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
      }
    }
  }
}

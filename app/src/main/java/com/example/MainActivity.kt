package com.example

import android.annotation.SuppressLint
import android.graphics.Color
import android.os.Bundle
import android.view.KeyEvent
import android.view.ViewGroup
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color as ComposeColor
import androidx.compose.ui.viewinterop.AndroidView
import java.io.IOException

class MainActivity : ComponentActivity() {

  private var webViewRef: WebView? = null
  private lateinit var bridge: FireOSBridge

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge(
      statusBarStyle = SystemBarStyle.dark(Color.TRANSPARENT),
      navigationBarStyle = SystemBarStyle.dark(Color.TRANSPARENT),
    )

    bridge = FireOSBridge(this) { webViewRef }

    onBackPressedDispatcher.addCallback(
      this,
      object : OnBackPressedCallback(true) {
        override fun handleOnBackPressed() {
          val wv = webViewRef
          if (wv == null) {
            isEnabled = false
            onBackPressedDispatcher.onBackPressed()
            return
          }
          wv.evaluateJavascript("window.handleNativeBack ? window.handleNativeBack() : false;") { result ->
            if (result != "true") {
              isEnabled = false
              onBackPressedDispatcher.onBackPressed()
              isEnabled = true
            }
          }
        }
      },
    )

    setContent {
      SleepSoundsWebHost(
        onWebViewCreated = { webView ->
          webViewRef = webView
        },
        bridge = bridge,
      )
    }
  }

  override fun dispatchKeyEvent(event: KeyEvent): Boolean {
    if (event.action == KeyEvent.ACTION_DOWN) {
      val mediaAction =
        when (event.keyCode) {
          KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE -> "play_pause"
          KeyEvent.KEYCODE_MEDIA_PLAY -> "play"
          KeyEvent.KEYCODE_MEDIA_PAUSE -> "pause"
          KeyEvent.KEYCODE_MEDIA_STOP -> "stop"
          KeyEvent.KEYCODE_MEDIA_NEXT -> "next"
          KeyEvent.KEYCODE_MEDIA_PREVIOUS -> "previous"
          else -> null
        }
      if (mediaAction != null) {
        webViewRef?.evaluateJavascript(
          "window.handleNativeMediaKey && window.handleNativeMediaKey('$mediaAction');",
          null,
        )
        return true
      }
    }
    return super.dispatchKeyEvent(event)
  }

  override fun onDestroy() {
    bridge.abandonAudioFocus()
    webViewRef?.destroy()
    webViewRef = null
    super.onDestroy()
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun SleepSoundsWebHost(
  onWebViewCreated: (WebView) -> Unit,
  bridge: FireOSBridge,
) {
  Box(
    modifier =
      Modifier.fillMaxSize()
        .background(ComposeColor(0xFF060F1D))
        .windowInsetsPadding(WindowInsets.safeDrawing)
  ) {
    AndroidView(
      modifier = Modifier.fillMaxSize(),
      factory = { context ->
        WebView(context).apply {
          layoutParams =
            ViewGroup.LayoutParams(
              ViewGroup.LayoutParams.MATCH_PARENT,
              ViewGroup.LayoutParams.MATCH_PARENT,
            )
          setBackgroundColor(Color.parseColor("#060F1D"))
          isFocusable = true
          isFocusableInTouchMode = true

          settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            allowFileAccess = false
            allowContentAccess = false
            useWideViewPort = true
            loadWithOverviewMode = true
            cacheMode = WebSettings.LOAD_DEFAULT
          }

          addJavascriptInterface(bridge, "FireOSBridge")

          webViewClient =
            object : WebViewClient() {
              override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?,
              ): WebResourceResponse? {
                val url = request?.url ?: return null
                if (url.host != APP_HOST) return null
                val rawPath = url.path?.trimStart('/') ?: "index.html"
                val relPath = if (rawPath.isEmpty()) "index.html" else rawPath
                val assetPath = "Sleep-Sounds-App/$relPath"
                return try {
                  val stream = context.assets.open(assetPath)
                  WebResourceResponse(guessMimeType(relPath), "UTF-8", stream)
                } catch (_: IOException) {
                  null
                }
              }
            }

          loadUrl("https://$APP_HOST/index.html")
          onWebViewCreated(this)
        }
      },
    )
  }
}

private const val APP_HOST = "appassets.androidplatform.net"

private fun guessMimeType(path: String): String {
  val lower = path.lowercase()
  return when {
    lower.endsWith(".html") -> "text/html"
    lower.endsWith(".css") -> "text/css"
    lower.endsWith(".js") -> "application/javascript"
    lower.endsWith(".svg") -> "image/svg+xml"
    lower.endsWith(".jpg") || lower.endsWith(".jpeg") -> "image/jpeg"
    lower.endsWith(".png") -> "image/png"
    lower.endsWith(".wav") -> "audio/wav"
    lower.endsWith(".ogg") -> "audio/ogg"
    lower.endsWith(".mp3") -> "audio/mpeg"
    lower.endsWith(".json") -> "application/json"
    else -> "application/octet-stream"
  }
}

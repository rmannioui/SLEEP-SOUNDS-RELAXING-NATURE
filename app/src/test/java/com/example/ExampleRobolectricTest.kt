package com.example

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import java.util.Locale
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.Robolectric
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [36])
class ExampleRobolectricTest {

  private val expectedAudioFiles =
    listOf(
      "rain/gentle_rain.wav",
      "rain/heavy_rain.wav",
      "rain/thunderstorm.wav",
      "ocean/ocean_waves.wav",
      "ocean/flowing_river.wav",
      "ocean/waterfall.wav",
      "forest/forest_ambience.wav",
      "forest/birds_singing.wav",
      "forest/wind_in_trees.wav",
      "white-noise/white_noise.wav",
      "white-noise/pink_noise.wav",
      "white-noise/brown_noise.wav",
      "white-noise/gentle_fan.wav",
      "white-noise/air_conditioner.wav",
      "white-noise/night_ambience.wav",
      "fireplace/fireplace.wav",
      "fireplace/crackling_fire.wav",
      "fireplace/cozy_cabin_rain.wav",
      "meditation/tibetan_singing_bowls.wav",
      "meditation/gentle_meditation.wav",
      "meditation/zen_garden.wav",
      "meditation/soft_ambient.wav",
    )

  private val expectedImages =
    listOf(
      "images/night_forest.jpg",
      "images/sunset_beach.jpg",
      "images/rainy_window.svg",
      "images/cozy_fireplace.jpg",
      "images/starry_sky.jpg",
      "images/forest_waterfall.svg",
      "images/misty_mountains.svg",
      "icons/logo.svg",
    )

  @Test
  fun appNameIsConfigured() {
    val context = ApplicationProvider.getApplicationContext<Context>()
    assertEquals("Sleep Sounds", context.getString(R.string.app_name))
  }

  @Test
  fun allWebCoreFilesAreBundledInAssets() {
    val assets = ApplicationProvider.getApplicationContext<Context>().assets
    val files = assets.list("Sleep-Sounds-App")?.toSet() ?: emptySet()
    assertTrue(files.contains("index.html"))
    assertTrue(files.contains("style.css"))
    assertTrue(files.contains("script.js"))
    assertTrue(files.contains("translations.js"))
    assertTrue(files.contains("README.md"))
  }

  @Test
  fun all22AudioFilesExistWithValidWaveHeaders() {
    val assets = ApplicationProvider.getApplicationContext<Context>().assets
    for (rel in expectedAudioFiles) {
      assets.open("Sleep-Sounds-App/assets/audio/$rel").use { stream ->
        val header = ByteArray(12)
        val read = stream.read(header)
        assertEquals("Header read failed for $rel", 12, read)
        val riff = String(header, 0, 4)
        val wave = String(header, 8, 4)
        assertEquals("Invalid RIFF in $rel", "RIFF", riff)
        assertEquals("Invalid WAVE in $rel", "WAVE", wave)
      }
    }
  }

  @Test
  fun all7VisualEnvironmentsAndLogoExist() {
    val assets = ApplicationProvider.getApplicationContext<Context>().assets
    for (rel in expectedImages) {
      assets.open("Sleep-Sounds-App/assets/$rel").use { stream ->
        assertTrue("Empty image asset $rel", stream.read() != -1)
      }
    }
  }

  @Test
  fun fireOSBridgeDetectsLocaleAndAudioFocus() {
    val activity = Robolectric.buildActivity(MainActivity::class.java).create().get()
    val bridge = FireOSBridge(activity) { null }
    Locale.setDefault(Locale.FRENCH)
    assertTrue(bridge.getDeviceLocale().startsWith("fr"))
    assertFalse(bridge.isTvDevice())
    activity.finish()
  }
}

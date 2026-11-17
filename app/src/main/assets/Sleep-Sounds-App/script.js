(function () {
  "use strict";

  const APP_VERSION = "1.0.0";
  const SUPPORTED_LANGS = ["en", "fr", "ar", "es", "de", "it", "pt", "nl", "pl", "ja"];

  const STORAGE_KEYS = {
    prefs: "sleep_sounds_prefs_v1",
    favorites: "sleep_sounds_favorites_v1",
    recent: "sleep_sounds_recent_v1",
    savedMixes: "sleep_sounds_saved_mixes_v1"
  };

  /* 22 Bundled Offline Sounds */
  const SOUNDS = [
    // Nature Sounds
    { id: "gentle_rain", cat: "nature", icon: "🌧️", src: "assets/audio/rain/gentle_rain.wav", featured: true },
    { id: "heavy_rain", cat: "nature", icon: "☔", src: "assets/audio/rain/heavy_rain.wav" },
    { id: "thunderstorm", cat: "nature", icon: "⛈️", src: "assets/audio/rain/thunderstorm.wav", featured: true },
    { id: "ocean_waves", cat: "nature", icon: "🌊", src: "assets/audio/ocean/ocean_waves.wav", featured: true },
    { id: "flowing_river", cat: "nature", icon: "🏞️", src: "assets/audio/ocean/flowing_river.wav" },
    { id: "waterfall", cat: "nature", icon: "💧", src: "assets/audio/ocean/waterfall.wav" },
    { id: "forest_ambience", cat: "nature", icon: "🌲", src: "assets/audio/forest/forest_ambience.wav", featured: true },
    { id: "birds_singing", cat: "nature", icon: "🐦", src: "assets/audio/forest/birds_singing.wav" },
    { id: "wind_in_trees", cat: "nature", icon: "🍃", src: "assets/audio/forest/wind_in_trees.wav" },
    // Sleep Sounds
    { id: "white_noise", cat: "sleep", icon: "📻", src: "assets/audio/white-noise/white_noise.wav" },
    { id: "pink_noise", cat: "sleep", icon: "🌫️", src: "assets/audio/white-noise/pink_noise.wav", featured: true },
    { id: "brown_noise", cat: "sleep", icon: "🌑", src: "assets/audio/white-noise/brown_noise.wav" },
    { id: "gentle_fan", cat: "sleep", icon: "🌀", src: "assets/audio/white-noise/gentle_fan.wav" },
    { id: "air_conditioner", cat: "sleep", icon: "❄️", src: "assets/audio/white-noise/air_conditioner.wav" },
    { id: "night_ambience", cat: "sleep", icon: "🦗", src: "assets/audio/white-noise/night_ambience.wav" },
    // Fire & Cozy Sounds
    { id: "fireplace", cat: "fire", icon: "🔥", src: "assets/audio/fireplace/fireplace.wav", featured: true },
    { id: "crackling_fire", cat: "fire", icon: "🪵", src: "assets/audio/fireplace/crackling_fire.wav" },
    { id: "cozy_cabin_rain", cat: "fire", icon: "🏡", src: "assets/audio/fireplace/cozy_cabin_rain.wav" },
    // Meditation & Relaxation
    { id: "tibetan_singing_bowls", cat: "meditation", icon: "🔔", src: "assets/audio/meditation/tibetan_singing_bowls.wav", featured: true },
    { id: "gentle_meditation", cat: "meditation", icon: "🧘", src: "assets/audio/meditation/gentle_meditation.wav" },
    { id: "zen_garden", cat: "meditation", icon: "🎋", src: "assets/audio/meditation/zen_garden.wav" },
    { id: "soft_ambient", cat: "meditation", icon: "✨", src: "assets/audio/meditation/soft_ambient.wav" }
  ];

  const PRESET_MIXES = [
    { id: "mix_rain_thunder", tracks: [{ id: "gentle_rain", vol: 0.78 }, { id: "thunderstorm", vol: 0.52 }] },
    { id: "mix_ocean_wind", tracks: [{ id: "ocean_waves", vol: 0.80 }, { id: "wind_in_trees", vol: 0.48 }] },
    { id: "mix_forest_birds", tracks: [{ id: "forest_ambience", vol: 0.75 }, { id: "birds_singing", vol: 0.55 }] },
    { id: "mix_rain_fireplace", tracks: [{ id: "cozy_cabin_rain", vol: 0.72 }, { id: "fireplace", vol: 0.68 }] },
    { id: "mix_waterfall_birds", tracks: [{ id: "waterfall", vol: 0.70 }, { id: "birds_singing", vol: 0.55 }] }
  ];

  const ENVIRONMENTS = [
    { id: "night_forest", key: "env_night_forest", src: "assets/images/night_forest.jpg" },
    { id: "sunset_beach", key: "env_sunset_beach", src: "assets/images/sunset_beach.jpg" },
    { id: "rainy_window", key: "env_rainy_window", src: "assets/images/rainy_window.svg" },
    { id: "cozy_fireplace", key: "env_cozy_fireplace", src: "assets/images/cozy_fireplace.jpg" },
    { id: "starry_sky", key: "env_starry_sky", src: "assets/images/starry_sky.jpg" },
    { id: "forest_waterfall", key: "env_forest_waterfall", src: "assets/images/forest_waterfall.svg" },
    { id: "misty_mountains", key: "env_misty_mountains", src: "assets/images/misty_mountains.svg" }
  ];

  const CATEGORIES = [
    { id: "nature", emoji: "🌧️", titleKey: "catNature", descKey: "catNatureDesc" },
    { id: "sleep", emoji: "🌙", titleKey: "catSleep", descKey: "catSleepDesc" },
    { id: "fire", emoji: "🔥", titleKey: "catFire", descKey: "catFireDesc" },
    { id: "meditation", emoji: "🧘", titleKey: "catMeditation", descKey: "catMeditationDesc" }
  ];

  const DEFAULT_PREFS = {
    language: "auto",
    uiMode: "auto",
    defaultVolume: 0.75,
    smoothFades: true,
    sleepDimness: 55,
    ambientMotion: true,
    activeSceneId: "night_forest"
  };

  /* ---------------- State ---------------- */
  const state = {
    prefs: loadJson(STORAGE_KEYS.prefs, DEFAULT_PREFS),
    favorites: loadJson(STORAGE_KEYS.favorites, []),
    recent: loadJson(STORAGE_KEYS.recent, []),
    savedMixes: loadJson(STORAGE_KEYS.savedMixes, []),
    resolvedLang: "en",
    detectedLang: "en",
    currentView: "home",
    libraryCategory: "all",
    playbackMode: "idle", // "idle" | "single" | "mix"
    activeSoundId: "gentle_rain",
    isPlaying: false,
    loopEnabled: true,
    masterVolume: 0.75,
    soundVolumes: {}, // soundId -> 0..1
    mixTracks: [], // [{ id, vol }]
    sleepScreenOpen: false,
    timer: {
      totalSeconds: 0,
      remainingSeconds: 0,
      running: false,
      paused: false,
      intervalId: null,
      fadeStarted: false
    },
    elapsedSeconds: 0,
    elapsedIntervalId: null,
    sleepIdleTimeout: null
  };

  SOUNDS.forEach((s) => {
    state.soundVolumes[s.id] = 0.8;
  });
  state.masterVolume = clamp(state.prefs.defaultVolume ?? 0.75, 0, 1);

  /* ---------------- Audio Engine (Web Audio API + HTML5 Fallback) ---------------- */
  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.bufferCache = new Map();
      this.activeNodes = new Map(); // id -> { source, gain, isHtml, audioEl, startTime, duration }
      this.useHtmlFallback = false;
      this.fallbackNotified = false;
    }

    ensureContext() {
      if (this.useHtmlFallback) return null;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        this.useHtmlFallback = true;
        return null;
      }
      if (!this.ctx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(state.masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }

    async loadBuffer(sound) {
      if (this.bufferCache.has(sound.id)) {
        return this.bufferCache.get(sound.id);
      }
      const ctx = this.ensureContext();
      if (!ctx) throw new Error("No Web Audio context");
      const resp = await fetch(sound.src);
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const arrBuf = await resp.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrBuf);
      this.bufferCache.set(sound.id, decoded);
      return decoded;
    }

    async startTrack(soundId, volume, loop = true) {
      const sound = SOUNDS.find((s) => s.id === soundId);
      if (!sound) return;
      this.stopTrack(soundId, true);

      const fadeTime = state.prefs.smoothFades ? 0.55 : 0.03;

      if (!this.useHtmlFallback) {
        try {
          const ctx = this.ensureContext();
          const buffer = await this.loadBuffer(sound);
          // Re-verify if user stopped before decode completed
          if (!state.isPlaying) return;

          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.loop = loop;

          const gain = ctx.createGain();
          const now = ctx.currentTime;
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(Math.max(0.0001, volume), now + fadeTime);

          source.connect(gain);
          gain.connect(this.masterGain);

          source.onended = () => {
            if (!loop && this.activeNodes.has(soundId)) {
              const entry = this.activeNodes.get(soundId);
              if (entry && entry.source === source) {
                this.activeNodes.delete(soundId);
                if (this.activeNodes.size === 0 && state.playbackMode === "single") {
                  state.isPlaying = false;
                  renderPlayer();
                  renderLibrary();
                }
              }
            }
          };

          source.start(0);
          this.activeNodes.set(soundId, {
            isHtml: false,
            source,
            gain,
            startTime: ctx.currentTime,
            duration: buffer.duration
          });
          return;
        } catch (err) {
          this.useHtmlFallback = true;
          if (!this.fallbackNotified) {
            this.fallbackNotified = true;
            showToast(t("audioErrorFallback"));
          }
        }
      }

      // HTML5 Audio API Fallback
      try {
        const el = new Audio(sound.src);
        el.loop = loop;
        el.volume = clamp(volume * state.masterVolume, 0, 1);
        await el.play();
        this.activeNodes.set(soundId, {
          isHtml: true,
          audioEl: el,
          trackVol: volume,
          startTime: performance.now() / 1000,
          duration: el.duration || 6
        });
      } catch (err) {
        showToast(t("audioErrorTitle") + ": " + sound.id);
      }
    }

    stopTrack(soundId, immediate = false) {
      const entry = this.activeNodes.get(soundId);
      if (!entry) return;
      this.activeNodes.delete(soundId);

      if (entry.isHtml) {
        try {
          entry.audioEl.pause();
          entry.audioEl.currentTime = 0;
          entry.audioEl.src = "";
        } catch (_) {}
        return;
      }

      const ctx = this.ctx;
      if (!ctx) return;
      const now = ctx.currentTime;
      const fade = immediate || !state.prefs.smoothFades ? 0.03 : 0.35;
      try {
        entry.gain.gain.cancelScheduledValues(now);
        entry.gain.gain.setValueAtTime(entry.gain.gain.value, now);
        entry.gain.gain.linearRampToValueAtTime(0.0001, now + fade);
        entry.source.stop(now + fade + 0.04);
      } catch (_) {}
    }

    stopAll(immediate = false) {
      Array.from(this.activeNodes.keys()).forEach((id) => this.stopTrack(id, immediate));
    }

    setTrackVolume(soundId, volume) {
      const entry = this.activeNodes.get(soundId);
      if (!entry) return;
      if (entry.isHtml) {
        entry.trackVol = volume;
        entry.audioEl.volume = clamp(volume * state.masterVolume, 0, 1);
      } else if (this.ctx) {
        entry.gain.gain.setTargetAtTime(Math.max(0.0001, volume), this.ctx.currentTime, 0.04);
      }
    }

    setMasterVolume(vol, rampSeconds = 0.05) {
      if (this.useHtmlFallback) {
        this.activeNodes.forEach((entry) => {
          if (entry.isHtml) {
            entry.audioEl.volume = clamp((entry.trackVol ?? 0.8) * vol, 0, 1);
          }
        });
        return;
      }
      if (this.ctx && this.masterGain) {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(Math.max(0.0001, vol), now + rampSeconds);
      }
    }

    setLoop(loop) {
      this.activeNodes.forEach((entry) => {
        if (entry.isHtml) {
          entry.audioEl.loop = loop;
        } else if (entry.source) {
          entry.source.loop = loop;
        }
      });
    }

    getCycleProgress() {
      const first = this.activeNodes.values().next().value;
      if (!first) return 0;
      const dur = first.duration || 6;
      if (first.isHtml) {
        return ((first.audioEl.currentTime || 0) % dur) / dur;
      }
      if (!this.ctx) return 0;
      const elapsed = Math.max(0, this.ctx.currentTime - first.startTime);
      return (elapsed % dur) / dur;
    }
  }

  const audio = new AudioEngine();

  /* ---------------- Helpers ---------------- */
  function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return Array.isArray(fallback) ? [...fallback] : { ...fallback };
      const parsed = JSON.parse(raw);
      if (Array.isArray(fallback)) return Array.isArray(parsed) ? parsed : [...fallback];
      return { ...fallback, ...parsed };
    } catch (_) {
      return Array.isArray(fallback) ? [...fallback] : { ...fallback };
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
  }

  function t(key) {
    const dict = (window.translations && window.translations[state.resolvedLang]) || window.translations.en;
    return dict[key] || (window.translations.en && window.translations.en[key]) || key;
  }

  function formatSeconds(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
  }

  let toastTimeout = null;
  function showToast(msg) {
    const el = document.getElementById("toastBanner");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => el.classList.add("hidden"), 3200);
  }

  /* ---------------- Language Detection & I18n ---------------- */
  function detectDeviceLanguage() {
    const candidates = [];
    try {
      if (window.FireOSBridge && typeof window.FireOSBridge.getDeviceLocale === "function") {
        const nativeTag = window.FireOSBridge.getDeviceLocale();
        if (nativeTag) candidates.push(nativeTag);
      }
    } catch (_) {}

    if (Array.isArray(navigator.languages)) {
      candidates.push(...navigator.languages);
    }
    if (navigator.language) candidates.push(navigator.language);
    if (navigator.userLanguage) candidates.push(navigator.userLanguage);

    try {
      const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale;
      if (intlLocale) candidates.push(intlLocale);
    } catch (_) {}

    for (const raw of candidates) {
      if (!raw || typeof raw !== "string") continue;
      const base = raw.toLowerCase().split(/[-_]/)[0];
      if (SUPPORTED_LANGS.includes(base)) {
        return base;
      }
    }
    return "en";
  }

  function applyLanguage() {
    state.detectedLang = detectDeviceLanguage();
    const chosen = state.prefs.language === "auto" ? state.detectedLang : state.prefs.language;
    state.resolvedLang = SUPPORTED_LANGS.includes(chosen) ? chosen : "en";

    document.documentElement.lang = state.resolvedLang;
    document.documentElement.dir = state.resolvedLang === "ar" ? "rtl" : "ltr";
    document.title = t("appName");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });

    const detectedEl = document.getElementById("detectedLanguageValue");
    if (detectedEl) detectedEl.textContent = state.detectedLang.toUpperCase();

    const langSelect = document.getElementById("languageSelect");
    if (langSelect) langSelect.value = state.prefs.language;

    renderAll();
  }

  /* ---------------- Device Mode Detection (Fire TV vs Fire Tablet) ---------------- */
  function applyUiMode() {
    let resolved = state.prefs.uiMode;
    if (resolved === "auto") {
      let isTv = false;
      try {
        if (window.FireOSBridge && typeof window.FireOSBridge.isTvDevice === "function") {
          isTv = Boolean(window.FireOSBridge.isTvDevice());
        }
      } catch (_) {}

      const ua = navigator.userAgent || "";
      if (/AFT|FireTV|Android TV|BRAVIA|SMART-TV/i.test(ua)) {
        isTv = true;
      } else if (!isTv && window.matchMedia && window.matchMedia("(pointer: fine)").matches && window.innerWidth >= 1100 && !("ontouchstart" in window)) {
        isTv = true;
      }
      resolved = isTv ? "tv" : "tablet";
    }

    document.body.classList.toggle("ui-tv", resolved === "tv");
    document.body.classList.toggle("ui-tablet", resolved !== "tv");
    document.body.classList.toggle("no-motion", !state.prefs.ambientMotion);

    const uiSelect = document.getElementById("uiModeSelect");
    if (uiSelect) uiSelect.value = state.prefs.uiMode;
  }

  /* ---------------- Playback Actions ---------------- */
  function recordRecent(soundId) {
    state.recent = [soundId, ...state.recent.filter((id) => id !== soundId)].slice(0, 8);
    saveJson(STORAGE_KEYS.recent, state.recent);
  }

  function requestNativeAudioFocus() {
    try {
      window.FireOSBridge?.requestAudioFocus?.();
    } catch (_) {}
  }

  function abandonNativeAudioFocus() {
    try {
      window.FireOSBridge?.abandonAudioFocus?.();
    } catch (_) {}
  }

  function startElapsedTicker() {
    clearInterval(state.elapsedIntervalId);
    state.elapsedIntervalId = setInterval(() => {
      if (state.isPlaying) {
        state.elapsedSeconds += 1;
        updateProgressUI();
      }
    }, 1000);
  }

  function stopElapsedTicker() {
    clearInterval(state.elapsedIntervalId);
    state.elapsedIntervalId = null;
  }

  function playSingleSound(soundId) {
    const sound = SOUNDS.find((s) => s.id === soundId);
    if (!sound) return;

    audio.stopAll(true);
    state.playbackMode = "single";
    state.activeSoundId = soundId;
    state.isPlaying = true;
    state.elapsedSeconds = 0;

    requestNativeAudioFocus();
    audio.setMasterVolume(state.masterVolume, 0.05);
    audio.startTrack(soundId, state.soundVolumes[soundId] ?? 0.8, state.loopEnabled);
    recordRecent(soundId);
    startElapsedTicker();

    renderHome();
    renderLibrary();
    renderPlayer();
    updateSleepScreenInfo();
  }

  function toggleSingleSound(soundId) {
    if (state.playbackMode === "single" && state.activeSoundId === soundId && state.isPlaying) {
      pausePlayback();
    } else {
      playSingleSound(soundId);
    }
  }

  function playMixerTracks() {
    if (state.mixTracks.length === 0) return;
    audio.stopAll(true);
    state.playbackMode = "mix";
    state.isPlaying = true;
    state.elapsedSeconds = 0;

    requestNativeAudioFocus();
    audio.setMasterVolume(state.masterVolume, 0.05);
    state.mixTracks.forEach((tr) => {
      audio.startTrack(tr.id, tr.vol, true);
      recordRecent(tr.id);
    });
    startElapsedTicker();

    renderHome();
    renderLibrary();
    renderMixer();
    renderPlayer();
    updateSleepScreenInfo();
  }

  function pausePlayback() {
    if (!state.isPlaying) return;
    state.isPlaying = false;
    audio.stopAll(false);
    stopElapsedTicker();
    abandonNativeAudioFocus();
    renderLibrary();
    renderPlayer();
    updateSleepScreenInfo();
  }

  function resumePlayback() {
    if (state.isPlaying) return;
    if (state.playbackMode === "mix" && state.mixTracks.length > 0) {
      playMixerTracks();
    } else {
      playSingleSound(state.activeSoundId || SOUNDS[0].id);
    }
  }

  function togglePlayPause() {
    if (state.isPlaying) pausePlayback();
    else resumePlayback();
  }

  function stopPlayback() {
    state.isPlaying = false;
    state.elapsedSeconds = 0;
    audio.stopAll(false);
    stopElapsedTicker();
    abandonNativeAudioFocus();
    renderLibrary();
    renderPlayer();
    updateSleepScreenInfo();
  }

  function switchSound(delta) {
    const idx = SOUNDS.findIndex((s) => s.id === state.activeSoundId);
    const nextIdx = (idx + delta + SOUNDS.length) % SOUNDS.length;
    playSingleSound(SOUNDS[nextIdx].id);
  }

  function setMasterVolume(vol) {
    state.masterVolume = clamp(Number(vol), 0, 1);
    audio.setMasterVolume(state.masterVolume, 0.05);
    const slider = document.getElementById("playerMasterVolume");
    if (slider) slider.value = String(state.masterVolume);
    const mixerSlider = document.getElementById("mixerMasterSlider");
    if (mixerSlider) mixerSlider.value = String(state.masterVolume);
    const pct = document.getElementById("mixerMasterPct");
    if (pct) pct.textContent = Math.round(state.masterVolume * 100) + "%";
  }

  /* ---------------- Mixer Actions ---------------- */
  function addTrackToMix(soundId) {
    const existing = state.mixTracks.find((tr) => tr.id === soundId);
    if (existing) {
      removeTrackFromMix(soundId);
      return;
    }
    if (state.mixTracks.length >= 6) {
      showToast(t("maxMixWarning"));
      return;
    }
    const vol = state.soundVolumes[soundId] ?? 0.7;
    state.mixTracks.push({ id: soundId, vol });
    playMixerTracks();
  }

  function removeTrackFromMix(soundId) {
    state.mixTracks = state.mixTracks.filter((tr) => tr.id !== soundId);
    audio.stopTrack(soundId, false);
    if (state.mixTracks.length === 0 && state.playbackMode === "mix") {
      state.isPlaying = false;
      state.playbackMode = "idle";
      stopElapsedTicker();
      abandonNativeAudioFocus();
    }
    renderMixer();
    renderLibrary();
    renderPlayer();
  }

  function loadPresetMix(presetId) {
    const preset = PRESET_MIXES.find((p) => p.id === presetId);
    if (!preset) return;
    state.mixTracks = preset.tracks.map((tr) => ({ ...tr }));
    playMixerTracks();
  }

  function saveCurrentMix(name) {
    if (state.mixTracks.length === 0) return;
    const cleanName = (name || "").trim() || state.mixTracks.map((tr) => t("snd_" + tr.id)).slice(0, 2).join(" + ");
    const item = {
      id: "mix_" + Date.now(),
      name: cleanName,
      tracks: state.mixTracks.map((tr) => ({ ...tr }))
    };
    state.savedMixes.unshift(item);
    saveJson(STORAGE_KEYS.savedMixes, state.savedMixes);
    showToast(t("mixSavedNotice"));
    renderMixer();
  }

  function loadSavedMix(mixId) {
    const item = state.savedMixes.find((m) => m.id === mixId);
    if (!item) return;
    state.mixTracks = item.tracks.map((tr) => ({ ...tr }));
    playMixerTracks();
  }

  function deleteSavedMix(mixId) {
    state.savedMixes = state.savedMixes.filter((m) => m.id !== mixId);
    saveJson(STORAGE_KEYS.savedMixes, state.savedMixes);
    renderMixer();
  }

  /* ---------------- Favorites ---------------- */
  function toggleFavorite(soundId) {
    if (state.favorites.includes(soundId)) {
      state.favorites = state.favorites.filter((id) => id !== soundId);
    } else {
      state.favorites.unshift(soundId);
    }
    saveJson(STORAGE_KEYS.favorites, state.favorites);
    renderHome();
    renderLibrary();
  }

  /* ---------------- Sleep Timer ---------------- */
  function startSleepTimer(minutes) {
    const mins = clamp(Math.round(Number(minutes) || 0), 1, 480);
    clearInterval(state.timer.intervalId);
    state.timer.totalSeconds = mins * 60;
    state.timer.remainingSeconds = mins * 60;
    state.timer.running = true;
    state.timer.paused = false;
    state.timer.fadeStarted = false;

    if (!state.isPlaying) {
      resumePlayback();
    }

    state.timer.intervalId = setInterval(tickSleepTimer, 1000);
    renderTimer();
    renderPlayer();
  }

  function tickSleepTimer() {
    if (!state.timer.running || state.timer.paused) return;
    state.timer.remainingSeconds -= 1;

    // Gradual fade-out over the final 10 seconds
    if (state.timer.remainingSeconds <= 10 && state.timer.remainingSeconds > 0 && !state.timer.fadeStarted) {
      state.timer.fadeStarted = true;
      audio.setMasterVolume(0.001, Math.max(1, state.timer.remainingSeconds));
    }

    if (state.timer.remainingSeconds <= 0) {
      clearInterval(state.timer.intervalId);
      state.timer.running = false;
      state.timer.paused = false;
      state.timer.remainingSeconds = 0;
      stopPlayback();
      // Restore configured master volume silently for next playback
      audio.setMasterVolume(state.masterVolume, 0.05);
      showToast(t("timerCompleted"));
    }

    renderTimer();
    renderPlayer();
    updateSleepScreenInfo();
  }

  function togglePauseTimer() {
    if (!state.timer.running) return;
    state.timer.paused = !state.timer.paused;
    renderTimer();
  }

  function cancelSleepTimer() {
    clearInterval(state.timer.intervalId);
    state.timer.running = false;
    state.timer.paused = false;
    state.timer.remainingSeconds = 0;
    state.timer.totalSeconds = 0;
    state.timer.fadeStarted = false;
    audio.setMasterVolume(state.masterVolume, 0.15);
    renderTimer();
    renderPlayer();
    updateSleepScreenInfo();
  }

  /* ---------------- Visual Environments & Sleep Screen ---------------- */
  function selectEnvironment(envId) {
    const env = ENVIRONMENTS.find((e) => e.id === envId) || ENVIRONMENTS[0];
    state.prefs.activeSceneId = env.id;
    saveJson(STORAGE_KEYS.prefs, state.prefs);

    document.getElementById("ambientBackdropImg").src = env.src;
    document.getElementById("homeHeroBg").src = env.src;
    document.getElementById("sleepScreenImg").src = env.src;
    renderScenes();
  }

  function openSleepScreen() {
    state.sleepScreenOpen = true;
    const overlay = document.getElementById("sleepScreenOverlay");
    overlay.classList.remove("hidden");
    overlay.classList.remove("controls-idle");
    document.documentElement.style.setProperty("--sleep-dimness", (state.prefs.sleepDimness / 100).toFixed(2));
    updateSleepScreenInfo();
    scheduleSleepControlsIdle();
    try {
      window.FireOSBridge?.setKeepScreenOn?.(true);
    } catch (_) {}
    const exitBtn = document.getElementById("sleepExitBtn");
    if (exitBtn) exitBtn.focus();
  }

  function closeSleepScreen() {
    state.sleepScreenOpen = false;
    document.getElementById("sleepScreenOverlay").classList.add("hidden");
    clearTimeout(state.sleepIdleTimeout);
    try {
      window.FireOSBridge?.setKeepScreenOn?.(false);
    } catch (_) {}
  }

  function scheduleSleepControlsIdle() {
    const overlay = document.getElementById("sleepScreenOverlay");
    overlay.classList.remove("controls-idle");
    clearTimeout(state.sleepIdleTimeout);
    state.sleepIdleTimeout = setTimeout(() => {
      if (state.sleepScreenOpen) overlay.classList.add("controls-idle");
    }, 5500);
  }

  function updateSleepScreenInfo() {
    const clockEl = document.getElementById("sleepClock");
    if (clockEl) {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString(state.resolvedLang, { hour: "2-digit", minute: "2-digit" });
    }
    const npEl = document.getElementById("sleepNowPlaying");
    if (npEl) {
      npEl.textContent = getActivePlaybackTitle();
    }
    const timerChip = document.getElementById("sleepTimerDisplay");
    if (timerChip) {
      if (state.timer.running) {
        timerChip.textContent = "⏱️ " + formatSeconds(state.timer.remainingSeconds);
        timerChip.classList.remove("hidden");
      } else {
        timerChip.classList.add("hidden");
      }
    }
  }

  /* ---------------- Navigation ---------------- */
  function navigateTo(viewName, filterCategory = null) {
    state.currentView = viewName;
    if (filterCategory) {
      state.libraryCategory = filterCategory;
    }

    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    const target = document.getElementById("view-" + viewName);
    if (target) target.classList.add("active");

    document.querySelectorAll(".nav-btn").forEach((b) => {
      const active = b.dataset.view === viewName;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", String(active));
    });

    if (viewName === "library") renderLibrary();
    if (viewName === "mixer") renderMixer();
    if (viewName === "timer") renderTimer();
    if (viewName === "scenes") renderScenes();
    if (viewName === "home") renderHome();

    document.getElementById("mainContent").scrollTop = 0;
  }

  /* ---------------- Rendering ---------------- */
  function getActivePlaybackTitle() {
    if (state.playbackMode === "mix" && state.mixTracks.length > 0) {
      return state.mixTracks.map((tr) => t("snd_" + tr.id)).slice(0, 3).join(" + ");
    }
    if (state.playbackMode === "single" && state.activeSoundId) {
      return t("snd_" + state.activeSoundId);
    }
    return t("nothingPlaying");
  }

  function createSoundCardElement(sound, compact = false) {
    const isThisPlaying = state.isPlaying && (
      (state.playbackMode === "single" && state.activeSoundId === sound.id) ||
      (state.playbackMode === "mix" && state.mixTracks.some((tr) => tr.id === sound.id))
    );
    const isFav = state.favorites.includes(sound.id);
    const inMix = state.mixTracks.some((tr) => tr.id === sound.id);
    const vol = state.soundVolumes[sound.id] ?? 0.8;

    const card = document.createElement("article");
    card.className = "sound-card" + (isThisPlaying ? " is-playing" : "");
    card.innerHTML = `
      <div class="sound-card-top">
        <div class="sound-art" aria-hidden="true">${sound.icon}</div>
        <div class="sound-card-meta">
          <div class="sound-card-title-row">
            <h3 class="sound-card-title">${t("snd_" + sound.id)}</h3>
            ${isThisPlaying ? '<span class="wave-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' : ""}
          </div>
          <p class="sound-card-desc">${t("snd_" + sound.id + "_desc")}</p>
        </div>
      </div>
      ${compact ? "" : `
        <div class="sound-volume-row">
          <span aria-hidden="true">🔊</span>
          <input type="range" class="range-slider focusable card-vol-slider" min="0" max="1" step="0.05" value="${vol}" aria-label="${t("volume")}" />
          <span class="pct-label">${Math.round(vol * 100)}%</span>
        </div>
      `}
      <div class="sound-card-actions">
        <button type="button" class="btn-primary sound-play-btn focusable">
          ${isThisPlaying && state.playbackMode === "single" ? "⏸ " + t("pause") : "▶ " + t("play")}
        </button>
        <button type="button" class="icon-btn fav-btn focusable ${isFav ? "is-fav" : ""}" aria-label="${isFav ? t("unfavorite") : t("favorite")}" title="${isFav ? t("unfavorite") : t("favorite")}">
          ${isFav ? "♥" : "♡"}
        </button>
        <button type="button" class="icon-btn mix-toggle-btn focusable ${inMix ? "in-mix" : ""}" aria-label="${t("addToMix")}" title="${inMix ? t("inMix") : t("addToMix")}">
          ${inMix ? "✓" : "+"}
        </button>
      </div>
    `;

    card.querySelector(".sound-play-btn").addEventListener("click", () => toggleSingleSound(sound.id));
    card.querySelector(".fav-btn").addEventListener("click", () => toggleFavorite(sound.id));
    card.querySelector(".mix-toggle-btn").addEventListener("click", () => addTrackToMix(sound.id));

    const volSlider = card.querySelector(".card-vol-slider");
    if (volSlider) {
      const pctEl = card.querySelector(".pct-label");
      volSlider.addEventListener("input", (e) => {
        const v = Number(e.target.value);
        state.soundVolumes[sound.id] = v;
        if (pctEl) pctEl.textContent = Math.round(v * 100) + "%";
        audio.setTrackVolume(sound.id, v);
      });
    }

    return card;
  }

  function renderHome() {
    const heroSound = SOUNDS.find((s) => s.id === state.activeSoundId) || SOUNDS[0];
    const quickNameEl = document.getElementById("heroQuickSoundName");
    if (quickNameEl) quickNameEl.textContent = t("snd_" + heroSound.id);

    const featuredGrid = document.getElementById("homeFeaturedGrid");
    featuredGrid.innerHTML = "";
    SOUNDS.filter((s) => s.featured).forEach((s) => featuredGrid.appendChild(createSoundCardElement(s, true)));

    const catGrid = document.getElementById("homeCategoriesGrid");
    catGrid.innerHTML = "";
    CATEGORIES.forEach((cat) => {
      const count = SOUNDS.filter((s) => s.cat === cat.id).length;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "category-card focusable";
      btn.innerHTML = `
        <div class="category-emoji" aria-hidden="true">${cat.emoji}</div>
        <div class="category-info">
          <h3>${t(cat.titleKey)}</h3>
          <p>${t(cat.descKey)}</p>
          <span class="category-count">${count} ${t("soundsCountSuffix")}</span>
        </div>
      `;
      btn.addEventListener("click", () => navigateTo("library", cat.id));
      catGrid.appendChild(btn);
    });

    const favGrid = document.getElementById("homeFavoritesGrid");
    favGrid.innerHTML = "";
    if (state.favorites.length === 0) {
      favGrid.innerHTML = `<div class="empty-state">${t("noFavorites")}</div>`;
    } else {
      state.favorites.map((id) => SOUNDS.find((s) => s.id === id)).filter(Boolean)
        .forEach((s) => favGrid.appendChild(createSoundCardElement(s, true)));
    }

    const recentGrid = document.getElementById("homeRecentGrid");
    recentGrid.innerHTML = "";
    if (state.recent.length === 0) {
      recentGrid.innerHTML = `<div class="empty-state">${t("noRecent")}</div>`;
    } else {
      state.recent.map((id) => SOUNDS.find((s) => s.id === id)).filter(Boolean)
        .forEach((s) => recentGrid.appendChild(createSoundCardElement(s, true)));
    }
  }

  function renderLibrary() {
    document.querySelectorAll("#libraryTabs .filter-chip").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.cat === state.libraryCategory);
    });

    const grid = document.getElementById("libraryGrid");
    grid.innerHTML = "";

    let list = SOUNDS;
    if (state.libraryCategory === "favorites") {
      list = state.favorites.map((id) => SOUNDS.find((s) => s.id === id)).filter(Boolean);
    } else if (state.libraryCategory === "recent") {
      list = state.recent.map((id) => SOUNDS.find((s) => s.id === id)).filter(Boolean);
    } else if (state.libraryCategory !== "all") {
      list = SOUNDS.filter((s) => s.cat === state.libraryCategory);
    }

    if (list.length === 0) {
      const msg = state.libraryCategory === "favorites" ? t("noFavorites") : t("noRecent");
      grid.innerHTML = `<div class="empty-state">${msg}</div>`;
      return;
    }

    list.forEach((sound) => grid.appendChild(createSoundCardElement(sound, false)));
  }

  function renderMixer() {
    const presetsGrid = document.getElementById("presetMixesGrid");
    presetsGrid.innerHTML = "";
    PRESET_MIXES.forEach((preset) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "preset-btn focusable";
      const sub = preset.tracks.map((tr) => t("snd_" + tr.id)).join(" • ");
      btn.innerHTML = `<span class="preset-title">${t(preset.id)}</span><span class="preset-sub">${sub}</span>`;
      btn.addEventListener("click", () => loadPresetMix(preset.id));
      presetsGrid.appendChild(btn);
    });

    const masterSlider = document.getElementById("mixerMasterSlider");
    if (masterSlider) masterSlider.value = String(state.masterVolume);
    const masterPct = document.getElementById("mixerMasterPct");
    if (masterPct) masterPct.textContent = Math.round(state.masterVolume * 100) + "%";

    const activeList = document.getElementById("activeMixerList");
    activeList.innerHTML = "";
    if (state.mixTracks.length === 0) {
      activeList.innerHTML = `<div class="empty-state">${t("mixerEmpty")}</div>`;
    } else {
      state.mixTracks.forEach((track) => {
        const sound = SOUNDS.find((s) => s.id === track.id);
        if (!sound) return;
        const row = document.createElement("div");
        row.className = "mixer-track-row";
        row.innerHTML = `
          <div class="mixer-track-label">
            <span>${sound.icon}</span>
            <span>${t("snd_" + sound.id)}</span>
          </div>
          <div class="mixer-track-controls">
            <button type="button" class="step-btn focusable vol-minus" aria-label="-">−</button>
            <input type="range" class="range-slider focusable track-vol" min="0" max="1" step="0.02" value="${track.vol}" />
            <button type="button" class="step-btn focusable vol-plus" aria-label="+">+</button>
            <span class="pct-label">${Math.round(track.vol * 100)}%</span>
            <button type="button" class="icon-btn focusable remove-track" aria-label="${t("remove")}">✕</button>
          </div>
        `;
        const slider = row.querySelector(".track-vol");
        const pct = row.querySelector(".pct-label");
        const updateVol = (val) => {
          track.vol = clamp(val, 0, 1);
          slider.value = String(track.vol);
          pct.textContent = Math.round(track.vol * 100) + "%";
          audio.setTrackVolume(track.id, track.vol);
        };
        slider.addEventListener("input", (e) => updateVol(Number(e.target.value)));
        row.querySelector(".vol-minus").addEventListener("click", () => updateVol(track.vol - 0.1));
        row.querySelector(".vol-plus").addEventListener("click", () => updateVol(track.vol + 0.1));
        row.querySelector(".remove-track").addEventListener("click", () => removeTrackFromMix(track.id));
        activeList.appendChild(row);
      });
    }

    const savedList = document.getElementById("savedMixesList");
    savedList.innerHTML = "";
    if (state.savedMixes.length === 0) {
      savedList.innerHTML = `<div class="empty-state">${t("noSavedMixes")}</div>`;
    } else {
      state.savedMixes.forEach((mix) => {
        const card = document.createElement("div");
        card.className = "saved-mix-card";
        card.innerHTML = `
          <div>
            <strong>${escapeHtml(mix.name)}</strong>
            <div class="preset-sub">${mix.tracks.length} ${t("tracksActive")}</div>
          </div>
          <div class="saved-mix-actions">
            <button type="button" class="btn-primary focusable load-saved-btn">${t("loadMix")}</button>
            <button type="button" class="icon-btn focusable del-saved-btn" aria-label="${t("deleteMix")}">🗑️</button>
          </div>
        `;
        card.querySelector(".load-saved-btn").addEventListener("click", () => loadSavedMix(mix.id));
        card.querySelector(".del-saved-btn").addEventListener("click", () => deleteSavedMix(mix.id));
        savedList.appendChild(card);
      });
    }

    const picker = document.getElementById("mixerPickerGrid");
    picker.innerHTML = "";
    SOUNDS.forEach((sound) => {
      const selected = state.mixTracks.some((tr) => tr.id === sound.id);
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "picker-chip focusable" + (selected ? " selected" : "");
      chip.innerHTML = `<span>${sound.icon}</span><span>${t("snd_" + sound.id)}</span>`;
      chip.addEventListener("click", () => addTrackToMix(sound.id));
      picker.appendChild(chip);
    });
  }

  function renderTimer() {
    const countdown = document.getElementById("timerCountdownText");
    const status = document.getElementById("timerStatusText");
    const ring = document.getElementById("timerRingProgress");
    const pauseBtn = document.getElementById("timerPauseResumeBtn");
    const cancelBtn = document.getElementById("timerCancelBtn");
    const navBadge = document.getElementById("navTimerBadge");

    const circumference = 2 * Math.PI * 86;
    if (state.timer.running) {
      countdown.textContent = formatSeconds(state.timer.remainingSeconds);
      const ratio = state.timer.totalSeconds > 0 ? state.timer.remainingSeconds / state.timer.totalSeconds : 0;
      ring.style.strokeDashoffset = String(circumference * (1 - ratio));

      if (state.timer.fadeStarted) {
        status.textContent = t("timerFadingOut");
      } else if (state.timer.paused) {
        status.textContent = t("timerPausedLabel");
      } else {
        status.textContent = t("timerActiveLabel");
      }

      pauseBtn.classList.remove("hidden");
      cancelBtn.classList.remove("hidden");
      pauseBtn.textContent = state.timer.paused ? t("timerResume") : t("timerPause");
      navBadge.textContent = formatSeconds(state.timer.remainingSeconds);
      navBadge.classList.remove("hidden");
    } else {
      countdown.textContent = "00:00";
      ring.style.strokeDashoffset = String(circumference);
      status.textContent = t("sleepTimerDesc");
      pauseBtn.classList.add("hidden");
      cancelBtn.classList.add("hidden");
      navBadge.classList.add("hidden");
    }
  }

  function renderScenes() {
    const grid = document.getElementById("scenesGrid");
    grid.innerHTML = "";
    ENVIRONMENTS.forEach((env) => {
      const active = state.prefs.activeSceneId === env.id;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "scene-card focusable" + (active ? " active" : "");
      btn.innerHTML = `
        <img src="${env.src}" alt="${t(env.key)}" loading="lazy" />
        <div class="scene-card-scrim"></div>
        <div class="scene-card-label">
          <span>${t(env.key)}</span>
          ${active ? "<span>✓</span>" : ""}
        </div>
      `;
      btn.addEventListener("click", () => selectEnvironment(env.id));
      grid.appendChild(btn);
    });
  }

  function renderPlayer() {
    const titleEl = document.getElementById("playerTitle");
    const modeEl = document.getElementById("playerModeLabel");
    const glyphEl = document.getElementById("playerIconGlyph");
    const playBtn = document.getElementById("playerPlayPauseBtn");
    const waveEl = document.getElementById("playerWave");
    const loopBtn = document.getElementById("playerLoopBtn");
    const timerPill = document.getElementById("playerTimerPill");
    const timerText = document.getElementById("playerTimerText");
    const masterSlider = document.getElementById("playerMasterVolume");

    titleEl.textContent = getActivePlaybackTitle();
    if (state.playbackMode === "mix") {
      modeEl.textContent = t("playingMix") + " (" + state.mixTracks.length + ")";
      glyphEl.textContent = "🎛️";
    } else if (state.playbackMode === "single") {
      modeEl.textContent = t("playingSingle");
      const snd = SOUNDS.find((s) => s.id === state.activeSoundId);
      glyphEl.textContent = snd ? snd.icon : "🌙";
    } else {
      modeEl.textContent = t("nowPlaying");
      glyphEl.textContent = "🌙";
    }

    playBtn.textContent = state.isPlaying ? "⏸" : "▶";
    playBtn.setAttribute("aria-label", state.isPlaying ? t("pause") : t("play"));
    waveEl.classList.toggle("paused", !state.isPlaying);
    loopBtn.classList.toggle("active", state.loopEnabled);
    if (masterSlider) masterSlider.value = String(state.masterVolume);

    if (state.timer.running) {
      timerPill.classList.remove("hidden");
      timerText.textContent = formatSeconds(state.timer.remainingSeconds);
    } else {
      timerPill.classList.add("hidden");
    }

    updateProgressUI();
  }

  function updateProgressUI() {
    const fill = document.getElementById("playerProgressFill");
    const time = document.getElementById("playerElapsedTime");
    if (fill) {
      const pct = state.isPlaying ? audio.getCycleProgress() * 100 : 0;
      fill.style.width = pct.toFixed(1) + "%";
    }
    if (time) {
      time.textContent = formatSeconds(state.elapsedSeconds);
    }
  }

  function renderSettings() {
    document.getElementById("languageSelect").value = state.prefs.language;
    document.getElementById("uiModeSelect").value = state.prefs.uiMode;
    document.getElementById("sleepDimnessSlider").value = String(state.prefs.sleepDimness);
    document.getElementById("sleepDimnessPct").textContent = state.prefs.sleepDimness + "%";
    document.getElementById("ambientMotionToggle").checked = Boolean(state.prefs.ambientMotion);
    const defVolPct = Math.round((state.prefs.defaultVolume ?? 0.75) * 100);
    document.getElementById("defaultVolumeSlider").value = String(defVolPct);
    document.getElementById("defaultVolumePct").textContent = defVolPct + "%";
    document.getElementById("smoothFadesToggle").checked = Boolean(state.prefs.smoothFades);
  }

  function renderAll() {
    renderHome();
    renderLibrary();
    renderMixer();
    renderTimer();
    renderScenes();
    renderSettings();
    renderPlayer();
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------- Fire TV D-Pad Spatial Navigation & Media Keys ---------------- */
  function getFocusableElements() {
    const modal = document.getElementById("privacyModal");
    if (!modal.classList.contains("hidden")) {
      return Array.from(modal.querySelectorAll(".focusable"));
    }
    const sleepOverlay = document.getElementById("sleepScreenOverlay");
    if (!sleepOverlay.classList.contains("hidden")) {
      return Array.from(sleepOverlay.querySelectorAll(".focusable"));
    }
    const activeView = document.querySelector(".view.active");
    const viewFocusables = activeView ? Array.from(activeView.querySelectorAll(".focusable:not(.hidden)")) : [];
    const navFocusables = Array.from(document.querySelectorAll("#mainNav .focusable"));
    const playerFocusables = Array.from(document.querySelectorAll("#playerBar .focusable:not(.hidden)"));
    return [...navFocusables, ...viewFocusables, ...playerFocusables].filter(
      (el) => el.offsetParent !== null && !el.disabled
    );
  }

  function moveSpatialFocus(direction) {
    const list = getFocusableElements();
    if (list.length === 0) return;
    const current = document.activeElement;
    if (!current || !list.includes(current)) {
      list[0].focus();
      return;
    }

    // Allow range inputs to adjust with Left/Right unless at boundary
    if (current.tagName === "INPUT" && current.type === "range" && (direction === "ArrowLeft" || direction === "ArrowRight")) {
      return;
    }

    const rect = current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    let best = null;
    let bestScore = Infinity;

    for (const cand of list) {
      if (cand === current) continue;
      const r = cand.getBoundingClientRect();
      const tx = r.left + r.width / 2;
      const ty = r.top + r.height / 2;
      const dx = tx - cx;
      const dy = ty - cy;

      let valid = false;
      if (direction === "ArrowRight" && dx > 12) valid = true;
      else if (direction === "ArrowLeft" && dx < -12) valid = true;
      else if (direction === "ArrowDown" && dy > 12) valid = true;
      else if (direction === "ArrowUp" && dy < -12) valid = true;

      if (!valid) continue;

      const primary = (direction === "ArrowLeft" || direction === "ArrowRight") ? Math.abs(dx) : Math.abs(dy);
      const cross = (direction === "ArrowLeft" || direction === "ArrowRight") ? Math.abs(dy) : Math.abs(dx);
      const score = primary + cross * 2.4;
      if (score < bestScore) {
        bestScore = score;
        best = cand;
      }
    }

    if (best) {
      best.focus({ preventScroll: false });
      best.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    }
  }

  function handleBackAction() {
    const modal = document.getElementById("privacyModal");
    if (!modal.classList.contains("hidden")) {
      modal.classList.add("hidden");
      return true;
    }
    if (state.sleepScreenOpen) {
      closeSleepScreen();
      return true;
    }
    if (state.currentView !== "home") {
      navigateTo("home");
      return true;
    }
    return false;
  }

  window.handleNativeBack = function () {
    return handleBackAction();
  };

  window.handleNativeMediaKey = function (action) {
    if (action === "play_pause") togglePlayPause();
    else if (action === "play") resumePlayback();
    else if (action === "pause") pausePlayback();
    else if (action === "stop") stopPlayback();
    else if (action === "next") switchSound(1);
    else if (action === "previous") switchSound(-1);
  };

  window.onNativeAudioFocusChange = function (focusState) {
    if (focusState === "loss" || focusState === "loss_transient") {
      if (state.isPlaying) {
        state.pausedBySystemFocus = true;
        pausePlayback();
      }
    } else if (focusState === "duck") {
      audio.setMasterVolume(state.masterVolume * 0.35, 0.15);
    } else if (focusState === "gain") {
      audio.setMasterVolume(state.masterVolume, 0.25);
      if (state.pausedBySystemFocus) {
        state.pausedBySystemFocus = false;
        resumePlayback();
      }
    }
  };

  /* ---------------- Event Binding ---------------- */
  function bindEvents() {
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => navigateTo(btn.dataset.view));
    });

    document.querySelectorAll("[data-goto]").forEach((btn) => {
      btn.addEventListener("click", () => navigateTo(btn.dataset.goto));
    });

    document.querySelectorAll('[data-action="sleep-screen"]').forEach((btn) => {
      btn.addEventListener("click", openSleepScreen);
    });

    document.getElementById("heroPlayBtn").addEventListener("click", () => {
      toggleSingleSound(state.activeSoundId || SOUNDS[0].id);
    });

    document.querySelectorAll("#libraryTabs .filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        state.libraryCategory = chip.dataset.cat;
        renderLibrary();
      });
    });

    // Mixer Events
    const mixerMaster = document.getElementById("mixerMasterSlider");
    mixerMaster.addEventListener("input", (e) => setMasterVolume(Number(e.target.value)));
    document.querySelectorAll("[data-master-step]").forEach((btn) => {
      btn.addEventListener("click", () => setMasterVolume(state.masterVolume + Number(btn.dataset.masterStep)));
    });
    document.getElementById("saveMixForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("mixNameInput");
      saveCurrentMix(input.value);
      input.value = "";
    });

    // Timer Events
    document.querySelectorAll("#timerPresetsGrid .timer-preset-btn").forEach((btn) => {
      btn.addEventListener("click", () => startSleepTimer(Number(btn.dataset.minutes)));
    });
    document.getElementById("customTimerMinus").addEventListener("click", () => {
      const inp = document.getElementById("customTimerInput");
      inp.value = String(clamp(Number(inp.value) - 5, 1, 480));
    });
    document.getElementById("customTimerPlus").addEventListener("click", () => {
      const inp = document.getElementById("customTimerInput");
      inp.value = String(clamp(Number(inp.value) + 5, 1, 480));
    });
    document.getElementById("customTimerStartBtn").addEventListener("click", () => {
      startSleepTimer(document.getElementById("customTimerInput").value);
    });
    document.getElementById("timerPauseResumeBtn").addEventListener("click", togglePauseTimer);
    document.getElementById("timerCancelBtn").addEventListener("click", cancelSleepTimer);

    // Player Bar Events
    document.getElementById("playerPlayPauseBtn").addEventListener("click", togglePlayPause);
    document.getElementById("playerStopBtn").addEventListener("click", stopPlayback);
    document.getElementById("playerPrevBtn").addEventListener("click", () => switchSound(-1));
    document.getElementById("playerNextBtn").addEventListener("click", () => switchSound(1));
    document.getElementById("playerLoopBtn").addEventListener("click", () => {
      state.loopEnabled = !state.loopEnabled;
      audio.setLoop(state.loopEnabled);
      renderPlayer();
    });
    document.getElementById("playerMasterVolume").addEventListener("input", (e) => setMasterVolume(Number(e.target.value)));
    document.getElementById("playerVolDown").addEventListener("click", () => setMasterVolume(state.masterVolume - 0.1));
    document.getElementById("playerVolUp").addEventListener("click", () => setMasterVolume(state.masterVolume + 0.1));

    // Sleep Screen Events
    const sleepOverlay = document.getElementById("sleepScreenOverlay");
    sleepOverlay.addEventListener("pointerdown", scheduleSleepControlsIdle);
    document.getElementById("sleepPlayPauseBtn").addEventListener("click", togglePlayPause);
    document.getElementById("sleepVolDownBtn").addEventListener("click", () => setMasterVolume(state.masterVolume - 0.1));
    document.getElementById("sleepVolUpBtn").addEventListener("click", () => setMasterVolume(state.masterVolume + 0.1));
    document.getElementById("sleepNextSceneBtn").addEventListener("click", () => {
      const idx = ENVIRONMENTS.findIndex((e) => e.id === state.prefs.activeSceneId);
      const next = ENVIRONMENTS[(idx + 1) % ENVIRONMENTS.length];
      selectEnvironment(next.id);
    });
    document.getElementById("sleepExitBtn").addEventListener("click", closeSleepScreen);

    // Settings Events
    document.getElementById("languageSelect").addEventListener("change", (e) => {
      state.prefs.language = e.target.value;
      saveJson(STORAGE_KEYS.prefs, state.prefs);
      applyLanguage();
    });
    document.getElementById("uiModeSelect").addEventListener("change", (e) => {
      state.prefs.uiMode = e.target.value;
      saveJson(STORAGE_KEYS.prefs, state.prefs);
      applyUiMode();
    });
    document.getElementById("sleepDimnessSlider").addEventListener("input", (e) => {
      state.prefs.sleepDimness = Number(e.target.value);
      saveJson(STORAGE_KEYS.prefs, state.prefs);
      document.getElementById("sleepDimnessPct").textContent = state.prefs.sleepDimness + "%";
      document.documentElement.style.setProperty("--sleep-dimness", (state.prefs.sleepDimness / 100).toFixed(2));
    });
    document.getElementById("ambientMotionToggle").addEventListener("change", (e) => {
      state.prefs.ambientMotion = e.target.checked;
      saveJson(STORAGE_KEYS.prefs, state.prefs);
      applyUiMode();
    });
    document.getElementById("defaultVolumeSlider").addEventListener("input", (e) => {
      const pct = Number(e.target.value);
      state.prefs.defaultVolume = pct / 100;
      saveJson(STORAGE_KEYS.prefs, state.prefs);
      document.getElementById("defaultVolumePct").textContent = pct + "%";
      setMasterVolume(state.prefs.defaultVolume);
    });
    document.getElementById("smoothFadesToggle").addEventListener("change", (e) => {
      state.prefs.smoothFades = e.target.checked;
      saveJson(STORAGE_KEYS.prefs, state.prefs);
    });
    document.getElementById("resetPrefsBtn").addEventListener("click", () => {
      state.prefs = { ...DEFAULT_PREFS };
      saveJson(STORAGE_KEYS.prefs, state.prefs);
      setMasterVolume(DEFAULT_PREFS.defaultVolume);
      selectEnvironment(DEFAULT_PREFS.activeSceneId);
      applyUiMode();
      applyLanguage();
      showToast(t("resetDoneNotice"));
    });

    // Privacy Policy Modal
    document.getElementById("openPrivacyBtn").addEventListener("click", () => {
      document.getElementById("privacyModal").classList.remove("hidden");
      document.getElementById("closePrivacyBtn").focus();
    });
    document.getElementById("closePrivacyBtn").addEventListener("click", () => {
      document.getElementById("privacyModal").classList.add("hidden");
    });

    // Global D-Pad / Remote / Media Key Handler
    document.addEventListener("keydown", (e) => {
      if (state.sleepScreenOpen) scheduleSleepControlsIdle();

      if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        // Don't hijack typing inside text input
        if (document.activeElement && document.activeElement.tagName === "INPUT" && document.activeElement.type === "text") {
          return;
        }
        e.preventDefault();
        moveSpatialFocus(e.key);
      } else if (e.key === "Escape" || e.key === "Backspace" || e.key === "BrowserBack") {
        if (document.activeElement && (document.activeElement.tagName === "INPUT" && document.activeElement.type === "text")) {
          return;
        }
        if (handleBackAction()) {
          e.preventDefault();
        }
      } else if (e.key === "MediaPlayPause") {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === "MediaStop") {
        e.preventDefault();
        stopPlayback();
      } else if (e.key === "MediaTrackNext") {
        e.preventDefault();
        switchSound(1);
      } else if (e.key === "MediaTrackPrevious") {
        e.preventDefault();
        switchSound(-1);
      }
    });

    // Keep clock & progress bar smooth
    setInterval(() => {
      if (state.isPlaying) updateProgressUI();
      if (state.sleepScreenOpen) updateSleepScreenInfo();
    }, 500);

    // Handle system locale changes dynamically when set to Auto
    window.addEventListener("languagechange", () => {
      if (state.prefs.language === "auto") {
        applyLanguage();
      }
    });
  }

  /* ---------------- Init ---------------- */
  function init() {
    selectEnvironment(state.prefs.activeSceneId || "night_forest");
    applyUiMode();
    applyLanguage();
    bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

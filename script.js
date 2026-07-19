(() => {
  const introTitle = document.getElementById("introTitle");
  const introScreen = document.getElementById("introScreen");
  const contentScreen = document.getElementById("contentScreen");
  const continueButton = document.getElementById("continueButton");
  const cursorGlow = document.querySelector(".cursor-glow");
  const ambientLayer = document.querySelector(".ambient");
  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector(".main-nav");
  const muteButton = document.querySelector(".mute-toggle");
  const muteIcon = muteButton?.querySelector(".mute-icon");

  let audioStarted = false;
  let audioContext;
  let masterGain;
  let filter;
  let musicTimer;
  let buttonTimer;
  let isMuted = false;
  let musicPlaying = false;
  let currentTrackIndex = 0;
  let trackSequenceTimer = null;
  let activeOscillators = [];

  const tracks = [
    {
      name: "Yıldızlı Gece",
      description: "Hafif ve sakin bir başlangıç",
      notes: [
        { freq: 220, duration: 0.8, gain: 0.03, type: "sine" },
        { freq: 261.63, duration: 0.7, gain: 0.025, type: "triangle" },
        { freq: 329.63, duration: 0.9, gain: 0.02, type: "sine" },
        { freq: 392, duration: 0.8, gain: 0.018, type: "triangle" }
      ]
    },
    {
      name: "Dumanlı Rüya",
      description: "Yavaş ve dokunsal bir akış",
      notes: [
        { freq: 196, duration: 1.1, gain: 0.028, type: "sawtooth" },
        { freq: 246.94, duration: 0.9, gain: 0.024, type: "sine" },
        { freq: 293.66, duration: 1.2, gain: 0.02, type: "triangle" }
      ]
    },
    {
      name: "Küçük Şafak",
      description: "Açılan bir günün ilk ışığı",
      notes: [
        { freq: 261.63, duration: 0.75, gain: 0.026, type: "triangle" },
        { freq: 329.63, duration: 0.7, gain: 0.022, type: "sine" },
        { freq: 392, duration: 0.8, gain: 0.02, type: "sawtooth" },
        { freq: 440, duration: 0.7, gain: 0.018, type: "sine" }
      ]
    },
    {
      name: "Gece Yolculuğu",
      description: "Rastgele ve hafif bir titreşim",
      notes: [
        { freq: 311.13, duration: 0.6, gain: 0.02, type: "sine" },
        { freq: 370, duration: 0.8, gain: 0.018, type: "triangle" },
        { freq: 440, duration: 0.7, gain: 0.016, type: "sawtooth" },
        { freq: 523.25, duration: 0.9, gain: 0.014, type: "sine" }
      ]
    }
  ];

  const poemOptions = [
    "Bir gece, bir yıldız ve biraz sessizlik.\nHer şey kendini yavaşça anlatır.",
    "Bir rüzgâr geçti, bir hatıra kaldı.\nSen ise hâlâ en güzel cümle gibisin.",
    "Duygular bazen susar, ama anlamlar o sırada büyür.\nBu yüzden her an bir şeyler bırakır."
  ];

  const confessionOptions = [
    "Bazen bir şey söylemek yerine, sessizce yanında olmak daha anlamlıdır.",
    "Sana karşı hislerimin en saf hali, bu sayfanın içindeki küçük bir ışık gibi.",
    "Kelimeler yetmezse, bir gülümseme yeterli olabilir."
  ];

  const surpriseOptions = [
    "Bu bölüm sana bir küçük sürpriz bıraktı: kendine bir dakika ayır.",
    "Bugün biraz daha yumuşak ol, biraz daha sakin kal.",
    "Bir şey eklemek istersen, bu alanı senin metinlerinle doldurabilirsin."
  ];

  function buildAtmosphere() {
    if (!ambientLayer) {
      return;
    }

    const starCount = 56;
    const particleCount = 38;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < starCount; i += 1) {
      const star = document.createElement("span");
      star.className = "star";
      const size = 0.1 + Math.random() * 0.24;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 4;
      star.style.setProperty("--size", `${size}rem`);
      star.style.left = `${left}%`;
      star.style.top = `${top}%`;
      star.style.setProperty("--delay", `${delay}s`);
      fragment.appendChild(star);
    }

    for (let i = 0; i < particleCount; i += 1) {
      const particle = document.createElement("span");
      particle.className = "particle";
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const size = 0.16 + Math.random() * 0.24;
      particle.style.left = `${left}%`;
      particle.style.top = `${top}%`;
      particle.style.width = `${size}rem`;
      particle.style.height = `${size}rem`;
      particle.style.setProperty("--delay", `${Math.random() * 5}s`);
      fragment.appendChild(particle);
    }

    ambientLayer.appendChild(fragment);
  }

  function animateCursor(event) {
    if (!cursorGlow) {
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    cursorGlow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  function toggleButtonMode() {
    if (continueButton) {
      continueButton.classList.toggle("is-alt");
    }
  }

  function createAudioEngine() {
    if (audioContext) {
      return audioContext;
    }

    audioStarted = true;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();

    masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 2.4);
    masterGain.connect(audioContext.destination);

    filter = audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1200;
    filter.connect(masterGain);

    return audioContext;
  }

  function stopAudioPlayback() {
    if (trackSequenceTimer) {
      window.clearTimeout(trackSequenceTimer);
      trackSequenceTimer = null;
    }

    activeOscillators.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch (error) {
        // ignore stopped oscillator
      }
    });
    activeOscillators = [];
    musicPlaying = false;

    const playButton = document.querySelector(".control-btn-play");
    if (playButton) {
      playButton.textContent = "▶";
    }
  }

  function updateMusicUi() {
    const currentTrack = tracks[currentTrackIndex];
    const title = document.getElementById("songTitle");
    const description = document.getElementById("songDescription");
    const meta = document.getElementById("songMeta");
    const status = document.getElementById("playbackStatus");

    if (title) {
      title.textContent = currentTrack.name;
    }
    if (description) {
      description.textContent = currentTrack.description;
    }
    if (meta) {
      meta.textContent = `Rastgele • ${currentTrack.name}`;
    }
    if (status) {
      status.textContent = musicPlaying ? "Çalıyor" : "Duraklatıldı";
    }
  }

  function playTrack(trackIndex) {
    createAudioEngine();
    currentTrackIndex = trackIndex;
    musicPlaying = true;
    updateMusicUi();

    stopAudioPlayback();

    const track = tracks[trackIndex];
    let step = 0;

    const playStep = () => {
      if (!musicPlaying) {
        return;
      }

      const note = track.notes[step % track.notes.length];
      const now = audioContext.currentTime + 0.02;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = note.type;
      oscillator.frequency.setValueAtTime(note.freq, now);
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(note.gain, now + 0.14);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + note.duration + 0.08);

      oscillator.connect(gainNode);
      gainNode.connect(filter);
      oscillator.start(now);
      oscillator.stop(now + note.duration + 0.1);
      activeOscillators.push(oscillator);

      step += 1;
      trackSequenceTimer = window.setTimeout(playStep, note.duration * 1000 + 180);
    };

    playStep();

    const playButton = document.querySelector(".control-btn-play");
    if (playButton) {
      playButton.textContent = "⏸";
    }
  }

  function toggleMusicPlayback() {
    if (!audioStarted) {
      createAudioEngine();
    }

    if (musicPlaying) {
      musicPlaying = false;
      stopAudioPlayback();
      updateMusicUi();
      return;
    }

    playTrack(currentTrackIndex);
  }

  function toggleNavigation() {
    if (!mainNav || !navToggle) {
      return;
    }

    const isOpen = mainNav.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  }

  function closeNavigation() {
    if (!mainNav || !navToggle) {
      return;
    }

    mainNav.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  function toggleMute() {
    if (!audioStarted) {
      createAudioEngine();
    }

    if (!masterGain) {
      return;
    }

    isMuted = !isMuted;
    const now = audioContext.currentTime;
    const target = isMuted ? 0.0001 : 0.2;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setTargetAtTime(target, now, 0.16);

    muteButton.classList.toggle("is-muted", isMuted);
    muteButton.setAttribute("aria-pressed", String(isMuted));
    if (muteIcon) {
      muteIcon.textContent = isMuted ? "🔈" : "🔊";
    }
  }

  function enterExperience() {
    if (!introScreen || !contentScreen) {
      return;
    }

    contentScreen.hidden = false;
    introScreen.classList.add("is-faded");
    contentScreen.classList.add("is-visible");
    setTimeout(() => {
      introScreen.style.display = "none";
    }, 760);
  }

  function initPoemPage() {
    const poemContainer = document.getElementById("poemText");
    const poemButton = document.getElementById("randomPoemButton");

    if (!poemContainer || !poemButton) {
      return;
    }

    const showPoem = () => {
      const randomPoem = poemOptions[Math.floor(Math.random() * poemOptions.length)];
      poemContainer.textContent = randomPoem;
    };

    poemButton.addEventListener("click", showPoem);
    showPoem();
  }

  function initConfessionPage() {
    const confessionText = document.getElementById("confessionText");
    const confessionButton = document.getElementById("randomConfessionButton");

    if (!confessionText || !confessionButton) {
      return;
    }

    const showConfession = () => {
      const randomConfession = confessionOptions[Math.floor(Math.random() * confessionOptions.length)];
      confessionText.textContent = randomConfession;
    };

    confessionButton.addEventListener("click", showConfession);
    showConfession();
  }

  function initSurprisePage() {
    const surpriseMessage = document.getElementById("surpriseMessage");
    const surpriseButton = document.getElementById("randomSurpriseButton");

    if (!surpriseMessage || !surpriseButton) {
      return;
    }

    const showSurprise = () => {
      const randomSurprise = surpriseOptions[Math.floor(Math.random() * surpriseOptions.length)];
      surpriseMessage.textContent = randomSurprise;
    };

    surpriseButton.addEventListener("click", showSurprise);
    showSurprise();
  }

  function initThemePage() {
    const themeButtons = Array.from(document.querySelectorAll(".theme-option"));
    if (!themeButtons.length) {
      return;
    }

    themeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        document.body.dataset.theme = button.dataset.theme;
      });
    });
  }

  function initMusicPage() {
    const trackButtons = Array.from(document.querySelectorAll(".playlist-option"));
    const playButton = document.querySelector(".control-btn-play");
    const nextButton = document.querySelector(".control-btn[data-action='next']");
    const prevButton = document.querySelector(".control-btn[data-action='prev']");

    if (!trackButtons.length) {
      return;
    }

    trackButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.track);
        playTrack(index);
      });
    });

    if (playButton) {
      playButton.addEventListener("click", toggleMusicPlayback);
    }
    if (nextButton) {
      nextButton.addEventListener("click", () => {
        const nextIndex = (currentTrackIndex + 1) % tracks.length;
        playTrack(nextIndex);
      });
    }
    if (prevButton) {
      prevButton.addEventListener("click", () => {
        const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        playTrack(prevIndex);
      });
    }

    updateMusicUi();
  }

  if (continueButton) {
    continueButton.addEventListener("click", () => {
      createAudioEngine();
      enterExperience();
    });
  }

  if (navToggle) {
    navToggle.addEventListener("click", toggleNavigation);
  }

  if (mainNav) {
    mainNav.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", closeNavigation);
    });
  }

  if (muteButton) {
    muteButton.addEventListener("click", toggleMute);
  }

  window.addEventListener("pointermove", animateCursor);
  window.addEventListener("load", () => {
    buildAtmosphere();
    if (introTitle) {
      requestAnimationFrame(() => {
        introTitle.classList.add("is-visible");
      });
    }
    buttonTimer = window.setInterval(toggleButtonMode, 2400);
    initPoemPage();
    initConfessionPage();
    initSurprisePage();
    initThemePage();
    initMusicPage();
  });

  window.addEventListener("beforeunload", () => {
    if (musicTimer) {
      window.clearTimeout(musicTimer);
    }
    if (buttonTimer) {
      window.clearInterval(buttonTimer);
    }
    stopAudioPlayback();
  });
})();

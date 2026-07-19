(() => {
  const introTitle = document.getElementById("introTitle");
  const introScreen = document.getElementById("introScreen");
  const contentScreen = document.getElementById("contentScreen");
  const continueButton = document.getElementById("continueButton");
  const cursorGlow = document.querySelector(".cursor-glow");
  const ambientLayer = document.querySelector(".ambient");

  let audioStarted = false;
  let audioContext;
  let masterGain;
  let filter;
  let musicTimer;
  let buttonTimer;

  function buildAtmosphere() {
    const starCount = 48;
    const particleCount = 32;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < starCount; i += 1) {
      const star = document.createElement("span");
      star.className = "star";
      const size = 0.12 + Math.random() * 0.25;
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
      const size = 0.18 + Math.random() * 0.24;
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
    const x = event.clientX;
    const y = event.clientY;
    cursorGlow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  function toggleButtonMode() {
    continueButton.classList.toggle("is-alt");
  }

  function startAmbientMusic() {
    if (audioStarted) {
      return;
    }

    audioStarted = true;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();

    masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 4.8);
    masterGain.connect(audioContext.destination);

    filter = audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1100;
    filter.connect(masterGain);

    const melody = [220, 261.63, 329.63, 392, 440, 392, 329.63, 261.63];
    let index = 0;

    function playTone(frequency, duration, type, gainValue, delay = 0) {
      const now = audioContext.currentTime + delay;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.detune.setValueAtTime(6, now);
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(gainValue, now + 0.2);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscillator.connect(gainNode);
      gainNode.connect(filter);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.05);
    }

    function scheduleLoop() {
      const now = audioContext.currentTime;
      const base = melody[index % melody.length];
      playTone(base * 0.5, 2.2, "sine", 0.025, 0.05);
      playTone(base * 1.15, 2.4, "triangle", 0.018, 0.18);
      playTone(base * 1.4, 2.1, "sine", 0.012, 0.3);
      index += 1;
      musicTimer = window.setTimeout(scheduleLoop, 2800);
      if (now > 0.5) {
        filter.frequency.linearRampToValueAtTime(1000, now + 0.8);
      }
    }

    scheduleLoop();
  }

  function enterExperience() {
    if (contentScreen.hidden) {
      contentScreen.hidden = false;
    }

    introScreen.classList.add("is-faded");
    contentScreen.classList.add("is-visible");
    setTimeout(() => {
      introScreen.style.display = "none";
    }, 760);
  }

  continueButton.addEventListener("click", () => {
    startAmbientMusic();
    enterExperience();
  });

  window.addEventListener("pointermove", animateCursor);
  window.addEventListener("load", () => {
    buildAtmosphere();
    requestAnimationFrame(() => {
      introTitle.classList.add("is-visible");
    });
    buttonTimer = window.setInterval(toggleButtonMode, 2400);
  });

  window.addEventListener("beforeunload", () => {
    if (musicTimer) {
      window.clearTimeout(musicTimer);
    }
    if (buttonTimer) {
      window.clearInterval(buttonTimer);
    }
  });
})();

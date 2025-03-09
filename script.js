document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('translator-modal');
    const openButton = document.getElementById('open-translator');
    const heroOpenButton = document.getElementById('hero-open-translator');
    const closeButton = document.getElementById('close-modal');
    const languageSelect = document.getElementById('language-select');
    const voiceSelect = document.getElementById('voice-select');
    const textInput = document.getElementById('text-input');
    const playButton = document.getElementById('play-button');
    const stopButton = document.getElementById('stop-button');
    const downloadButton = document.getElementById('download-button');
    
    let speechSynth = window.speechSynthesis;
    let speaking = false;
    let audioBlob = null;

    // Modal controls
    function openModal() {
        modal.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    openButton.addEventListener('click', openModal);
    heroOpenButton.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Load available voices
    function loadVoices() {
        const voices = speechSynth.getVoices();
        const currentLang = languageSelect.value;
        
        // Filter voices by selected language
        const languageVoices = voices.filter(voice => voice.lang.startsWith(currentLang));
        
        // Sort voices by name
        languageVoices.sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });
        
        voiceSelect.innerHTML = languageVoices
            .map(voice => `<option value="${voice.name}">${voice.name} ${voice.localService ? '(Local)' : '(Network)'}</option>`)
            .join('');

        // Enable/disable download button based on available voices
        downloadButton.disabled = languageVoices.length === 0;
    }

    // Update voices when language changes
    languageSelect.addEventListener('change', loadVoices);

    // Chrome loads voices asynchronously
    speechSynth.onvoiceschanged = loadVoices;
    loadVoices();

    function speak(download = false) {
        if (speaking) {
            speechSynth.cancel();
        }

        const text = textInput.value.trim();
        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoice = speechSynth.getVoices().find(voice => voice.name === voiceSelect.value);
        
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.lang = languageSelect.value;

        if (!download) {
            utterance.onstart = () => {
                speaking = true;
                playButton.style.opacity = '0.5';
                playButton.disabled = true;
            };

            utterance.onend = () => {
                speaking = false;
                playButton.style.opacity = '1';
                playButton.disabled = false;
            };

            speechSynth.speak(utterance);
        } else {
            // Create audio for download
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const mediaStreamDestination = audioContext.createMediaStreamDestination();
            
            // Create oscillator for audio generation
            const oscillator = audioContext.createOscillator();
            oscillator.connect(mediaStreamDestination);
            
            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
            const audioChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                
                // Create temporary link for download
                const link = document.createElement('a');
                link.href = audioUrl;
                link.download = 'speech.wav';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up
                URL.revokeObjectURL(audioUrl);
            };
            
            // Start recording
            mediaRecorder.start();
            
            // Speak and record
            speechSynth.speak(utterance);
            
            utterance.onend = () => {
                mediaRecorder.stop();
                oscillator.stop();
            };
            
            oscillator.start();
        }
    }

    function stop() {
        speechSynth.cancel();
         speaking = false;
        playButton.style.opacity = '1';
        playButton.disabled = false;
    }

    playButton.addEventListener('click', () => speak(false));
    stopButton.addEventListener('click', stop);
    downloadButton.addEventListener('click', () => speak(true));
});
// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isListening = false;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'hi-IN'; // Hindi language support
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
}

// Speech Synthesis Setup
const synth = window.speechSynthesis;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateStatus('Ready to assist you!');
});

// Voice Recognition
function startVoiceRecognition() {
    if (!recognition) {
        speak('Sorry, voice recognition is not supported in your browser.');
        addMessage('Voice recognition is not supported in your browser.', 'assistant');
        return;
    }

    if (isListening) {
        recognition.stop();
        return;
    }

    recognition.start();
    isListening = true;
    document.getElementById('voiceBtn').classList.add('listening');
    document.getElementById('listeningIndicator').classList.add('active');
    updateStatus('Listening...');
}

if (recognition) {
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById('userInput').value = transcript;
        processCommand(transcript);
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        updateStatus('Error: ' + event.error);
        stopListening();
    };

    recognition.onend = function() {
        stopListening();
    };
}

function stopListening() {
    isListening = false;
    document.getElementById('voiceBtn').classList.remove('listening');
    document.getElementById('listeningIndicator').classList.remove('active');
    updateStatus('Ready');
}

// Text to Speech
function speak(text) {
    if (synth.speaking) {
        synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    synth.speak(utterance);
}

// Send Message
function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();

    if (message === '') return;

    addMessage(message, 'user');
    input.value = '';
    processCommand(message);
}

function sendCommand(command) {
    document.getElementById('userInput').value = command;
    sendMessage();
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Add Message to Chat
function addMessage(text, sender) {
    const chatContainer = document.getElementById('chatContainer');
    const welcomeMessage = chatContainer.querySelector('.welcome-message');
    
    if (welcomeMessage) {
        welcomeMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;

    const icon = document.createElement('div');
    icon.className = 'message-icon';
    icon.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = text;

    messageDiv.appendChild(icon);
    messageDiv.appendChild(content);
    chatContainer.appendChild(messageDiv);

    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Process Commands
function processCommand(command) {
    const lowerCommand = command.toLowerCase();
    let response = '';

    // Time and Date
    if (lowerCommand.includes('time') || lowerCommand.includes('samay') || lowerCommand.includes('टाइम')) {
        const now = new Date();
        const time = now.toLocaleTimeString('hi-IN');
        response = `Abhi ka samay hai: ${time}`;
    }
    else if (lowerCommand.includes('date') || lowerCommand.includes('tarikh') || lowerCommand.includes('तारीख')) {
        const now = new Date();
        const date = now.toLocaleDateString('hi-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        response = `Aaj ki tarikh hai: ${date}`;
    }

    // Calculator
    else if (lowerCommand.includes('calculate') || lowerCommand.includes('calculator') || lowerCommand.includes('गणना')) {
        response = handleCalculator(command);
    }

    // Weather
    else if (lowerCommand.includes('weather') || lowerCommand.includes('mausam') || lowerCommand.includes('मौसम')) {
        response = 'Weather information: Aaj ka mausam sundar hai! Temperature lagbhag 25°C hai. (Note: Real-time weather ke liye API integration karein)';
    }

    // Jokes
    else if (lowerCommand.includes('joke') || lowerCommand.includes('mazak') || lowerCommand.includes('मजाक')) {
        response = getRandomJoke();
    }

    // Search
    else if (lowerCommand.includes('search') || lowerCommand.includes('khojo') || lowerCommand.includes('खोजो')) {
        const searchQuery = command.replace(/search|khojo|खोजो/gi, '').trim();
        if (searchQuery) {
            response = `Main "${searchQuery}" ke baare mein search kar raha hoon...`;
            setTimeout(() => {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
            }, 1000);
        } else {
            response = 'Kya search karna hai? Batayein!';
        }
    }

    // Wikipedia
    else if (lowerCommand.includes('wikipedia') || lowerCommand.includes('wiki')) {
        const searchQuery = command.replace(/wikipedia|wiki/gi, '').trim();
        if (searchQuery) {
            response = `Wikipedia par "${searchQuery}" search kar raha hoon...`;
            setTimeout(() => {
                window.open(`https://en.wikipedia.org/wiki/${encodeURIComponent(searchQuery)}`, '_blank');
            }, 1000);
        } else {
            response = 'Wikipedia par kya search karein?';
        }
    }

    // Open Website
    else if (lowerCommand.includes('open') || lowerCommand.includes('kholo') || lowerCommand.includes('खोलो')) {
        if (lowerCommand.includes('youtube')) {
            response = 'YouTube khol raha hoon...';
            setTimeout(() => window.open('https://www.youtube.com', '_blank'), 1000);
        } else if (lowerCommand.includes('google')) {
            response = 'Google khol raha hoon...';
            setTimeout(() => window.open('https://www.google.com', '_blank'), 1000);
        } else if (lowerCommand.includes('facebook')) {
            response = 'Facebook khol raha hoon...';
            setTimeout(() => window.open('https://www.facebook.com', '_blank'), 1000);
        } else {
            response = 'Kaunsi website kholni hai? Batayein!';
        }
    }

    // Reminder
    else if (lowerCommand.includes('remind') || lowerCommand.includes('yaad') || lowerCommand.includes('याद')) {
        response = 'Reminder set kar diya! Main aapko yaad dila dunga. (Note: Local storage ya notification API use karein)';
    }

    // News
    else if (lowerCommand.includes('news') || lowerCommand.includes('khabar') || lowerCommand.includes('खबर')) {
        response = 'Latest news: Aaj ki taaza khabrein... (Note: News API integrate karein real-time news ke liye)';
    }

    // Greetings
    else if (lowerCommand.includes('hello') || lowerCommand.includes('hi') || lowerCommand.includes('namaste') || lowerCommand.includes('नमस्ते')) {
        response = 'Namaste! Main aapka AI assistant hoon. Aap mujhse kuch bhi pooch sakte hain!';
    }
    else if (lowerCommand.includes('how are you') || lowerCommand.includes('kaise ho') || lowerCommand.includes('कैसे हो')) {
        response = 'Main bilkul theek hoon! Aapki madad karne ke liye tayyar hoon. Aap kaise hain?';
    }

    // Name
    else if (lowerCommand.includes('your name') || lowerCommand.includes('naam') || lowerCommand.includes('नाम')) {
        response = 'Mera naam AI Assistant hai. Main aapki madad ke liye yahan hoon!';
    }

    // Help
    else if (lowerCommand.includes('help') || lowerCommand.includes('madad') || lowerCommand.includes('मदद')) {
        response = `Main yeh sab kar sakta hoon:
        
• Time aur Date batana
• Calculator
• Weather information
• Jokes sunana
• Web search
• Wikipedia search
• Websites kholna (YouTube, Google, etc.)
• Reminders set karna
• News updates

Aap mujhse kuch bhi pooch sakte hain!`;
    }

    // Default Response
    else {
        response = 'Maaf kijiye, main yeh samajh nahi paya. Kya aap phir se bata sakte hain? "help" type karein commands dekhne ke liye.';
    }

    // Add response and speak
    setTimeout(() => {
        addMessage(response, 'assistant');
        speak(response);
    }, 500);
}

// Calculator Function
function handleCalculator(command) {
    try {
        // Extract numbers and operators
        const mathExpression = command.match(/[\d+\-*/().]+/g);
        
        if (mathExpression) {
            const expression = mathExpression.join('');
            // Safe evaluation
            const result = Function('"use strict"; return (' + expression + ')')();
            return `Jawab hai: ${result}`;
        } else {
            return 'Calculator use karne ke liye numbers aur operators (+, -, *, /) use karein. Example: "calculate 5 + 3"';
        }
    } catch (error) {
        return 'Calculation mein error hai. Sahi format mein likhen. Example: "calculate 10 * 5"';
    }
}

// Random Jokes
function getRandomJoke() {
    const jokes = [
        'Teacher: Tumhara homework kahan hai?\nStudent: Ghar par! 😄',
        'Ek baar ek aadmi ne apne dost se pucha: "Tum itne smart kaise ho?"\nDost: "Main AI assistant use karta hoon!" 😊',
        'Patient: Doctor, mujhe lagta hai main invisible ho gaya hoon!\nDoctor: Kaun bola? 😂',
        'Programmer ki wife: "Bazaar se doodh le aao, agar ande mile to 6 le aana."\nProgrammer 6 doodh le aaya! 🤣',
        'Teacher: "Silence" ka sentence banao.\nStudent: "Mere papa ke paas iPhone hai, isliye unke paas Silence mode hai!" 😄',
        'Ek ladka apni girlfriend se: "Tum meri zindagi ho!"\nGirlfriend: "Matlab complicated aur confusing?" 😅',
        'Boss: "Tum late kyun aaye?"\nEmployee: "Sir, aap ne kaha tha jaldi mat aana!" 😂',
        'Ek aadmi doctor ke paas gaya: "Doctor, mujhe bhool jaane ki bimari hai."\nDoctor: "Kab se?"\nAadmi: "Kab se kya?" 🤔'
    ];

    return jokes[Math.floor(Math.random() * jokes.length)];
}

// Update Status
function updateStatus(text) {
    document.getElementById('statusText').textContent = text;
}

// Feature Cards Click Events
document.addEventListener('DOMContentLoaded', function() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('click', function() {
            const feature = this.querySelector('span').textContent.toLowerCase();
            
            if (feature.includes('time')) {
                sendCommand('time kya hai');
            } else if (feature.includes('calculator')) {
                sendCommand('calculator 10 + 5');
            } else if (feature.includes('weather')) {
                sendCommand('weather batao');
            } else if (feature.includes('search')) {
                sendCommand('search artificial intelligence');
            } else if (feature.includes('reminder')) {
                sendCommand('remind me');
            } else if (feature.includes('joke')) {
                sendCommand('joke sunao');
            } else if (feature.includes('wikipedia')) {
                sendCommand('wikipedia India');
            } else if (feature.includes('news')) {
                sendCommand('news batao');
            }
        });
    });
});

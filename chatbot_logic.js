const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const chatWindow = document.getElementById('chat-window');

sendBtn.onclick = async () => {
    const message = userInput.value;
    if (!message) return;

    // User ka message screen par dikhana
    chatWindow.innerHTML += `<div class="user-msg">${message}</div>`;
    userInput.value = '';

    try {
        const response = await fetch(`http://127.0.0.1:8000/chat?query=${message}`);
        const data = await response.json();
        
        // Bot ka response dikhana
        chatWindow.innerHTML += `<div class="bot-msg">${data.response}</div>`;
        chatWindow.scrollTop = chatWindow.scrollHeight;
    } catch (error) {
        chatWindow.innerHTML += `<div class="bot-msg text-danger">Sorry, AI is offline.</div>`;
    }
};
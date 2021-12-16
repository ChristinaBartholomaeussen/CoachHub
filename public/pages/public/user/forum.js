const socket = io("/forum");
const messageInput = document.getElementById("message");
const messageForm = document.getElementById("message-form");
const messageWrapper = document.getElementById("message-wrapper");

function formatDateTime(timestamp) {
    var date = new Date(timestamp);
    var dateTime = `${date.getFullYear()}-${(date.getMonth()+ 1)}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
    return dateTime;
}


messageForm.addEventListener("submit", e => {
    e.preventDefault();
    const message = messageInput.value
    appendOwnMessage(`Du skriver: ${message}`, new Date());
    socket.emit("send-message", message);
    messageInput.value = '';
});

socket.on("user-has-joined", name => {
    appendMessage(`${name} har tilslutte sig forummet`, new Date());
});

socket.on("load-messages", data => {

    data.messages.map(message => {

        if(message.user_id === data.loggedInUser["id"]) {
            appendOwnMessage(`Du skriver: ${message.text}`, message.timestamp);
        } else {
            appendMessage(`${message.username} skriver: ${message.text}`, message.timestamp);
        }
    });
});


socket.on("chat-message", data => {
    
    appendMessage(`${data.name.username}: ${data.message}`, new Date());
});

socket.on("user-disconnected", name => {
    appendMessage(`${name} har forladt forummet`, new Date());
});


function appendMessage(message, timestamp) {

    const dateTime = formatDateTime(timestamp);
    
    const div = document.createElement("div");
    div.classList.add("mx-3", "my-3", "other-chat-message");

    const time = document.createElement("p");
    time.classList.add("text-muted");
    time.innerText = `Modtaget: ${dateTime}`;
    div.append(time);

    const text = document.createElement("p");
    text.innerText = message;
    div.append(text);
    messageWrapper.append(div);
    messageWrapper.scrollTop = messageWrapper.scrollHeight;
};

function appendOwnMessage(message, timestamp) {

    const dateTime = formatDateTime(timestamp);
    const div = document.createElement("div");
    const time = document.createElement("p");
    time.classList.add("text-muted");
    time.innerText = `Sendt: ${dateTime}`;
    div.append(time);

    const text = document.createElement("p");
    text.innerText = message;
    div.append(text);
    div.classList.add("mx-3", "my-3", "own-chat-message");
    messageWrapper.append(div);
    messageWrapper.scrollTop = messageWrapper.scrollHeight;
}
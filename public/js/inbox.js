const BASE_URL = "http://localhost:3000";
const token = localStorage.getItem("token");
const userName = localStorage.getItem("userName");
const limit = 20;
let page = 1;
let isLoading = false;

const socket = io(BASE_URL, { auth: { token } });

document.addEventListener('DOMContentLoaded', async () => {
    await showPreviousMessages();
    await fetchActiveUsers();
})

socket.on("message-received", (data) => {
    const { senderName, messageContent, fileUrl } = data;
    const chatWindow = document.querySelector(".chat-window");
    if (fileUrl) {
        chatWindow.prepend(createReceivedMessageElement(senderName, fileUrl, "file"));
    }
    if (messageContent) {
        chatWindow.prepend(createReceivedMessageElement(senderName, messageContent, "text"));
    }
})

socket.on("room-joined", (msg) => {
    const { newJoinee, phoneNumber } = msg;
    const participantsDiv = document.querySelector(".participants-div");
    let participant = document.getElementById(`${phoneNumber}`);
    if (!participant) {
        participant = document.createElement("p");
        participant.className = "participant-name";
        participant.id = `${phoneNumber}`;
        participant.textContent = newJoinee;
        participantsDiv.append(participant)
    }

})

socket.on("room-left", (msg) => {
    const { leftJoinee, phoneNumber } = msg;
    const leftParticipant = document.getElementById(`${phoneNumber}`);
    if (leftParticipant) {
        leftParticipant.remove();
    }
})



async function messageSendingHandler(event) {
    try {
        event.preventDefault();
        const messageContent = event.target.message.value;
        const fileInput = event.target.mediaInput.files;

        if (!messageContent && fileInput.length < 1) {
            alert("Nothing to send!");
            return;
        }

        let fileUrl = null;
        if (fileInput.length > 0) {
            const contentType = fileInput[0].type;
            if(!contentType.startsWith("image/")){
                alert("File Type not supported!");
                return
            }

            fileUrl = await uploadFileToS3(fileInput);
        }
        sendSocketMessage(messageContent, fileUrl)

        event.target.reset();
    } catch (error) {
        handleErrorMessage(error);
    }
}

function sendSocketMessage(messageContent = null, fileUrl = null) {
    socket.emit("chat-message", { messageContent, fileUrl }, (socketResponse) => {
        if (socketResponse.success) {
            const chatWindow = document.querySelector(".chat-window");
            if (fileUrl) {
                chatWindow.prepend(createSentMessageElement(fileUrl, "file"));
            }
            if (messageContent) {
                const messageDiv = createSentMessageElement(messageContent, "text");
                chatWindow.prepend(messageDiv);
            }

        } else {
            console.log("Message failed");
            throw new Error(socketResponse.error)
        }
    })
}

async function fetchMessages(page) {
    try {
        let prevMessages = [];
        const prevRes = await axios.get(BASE_URL + `/message/previous?page=${page}`, { headers: { token } });
        const { message: prevResMsg, data } = prevRes.data;
        console.log("prevResMsg", prevResMsg)
        prevMessages = [...prevMessages, ...data];

        if (prevMessages.length > 10) {
            return prevMessages;
        } else {

            const archiveRes = await axios.get(BASE_URL + `/message/archive?page=${page}&limit=${limit - prevMessages.length}`, { headers: { token } });
            const { message: archiveResMsg, data } = archiveRes.data;
            console.log("archiveResMsg", archiveResMsg)
            prevMessages = [...prevMessages, ...data];
            return prevMessages;
        }

    } catch (error) {
        handleErrorMessage(error);
    }
}

async function showPreviousMessages() {
    try {
        const prevMessages = await fetchMessages(1);
        const chatWindow = document.querySelector(".chat-window");
        prevMessages.forEach(msg => {
            if (msg.User.name === userName) {
                if (msg.isFile) {
                    chatWindow.append(createSentMessageElement(msg.content, "file"));
                } else {
                    chatWindow.append(createSentMessageElement(msg.content, "text"));
                }

            } else {
                if (msg.isFile) {
                    chatWindow.append(createReceivedMessageElement(msg.User.name, msg.content, "file"));
                } else {
                    chatWindow.append(createReceivedMessageElement(msg.User.name, msg.content, "text"));
                }
            }
        })
    } catch (error) {
        handleErrorMessage(error)
    }
}

async function fetchActiveUsers() {
    try {
        const res = await axios.get(BASE_URL + `/user/active`, { headers: { token } });
        const { message, data: activeUsers } = res.data;
        console.log(message);

        const participantsDiv = document.querySelector(".participants-div");
        activeUsers.forEach(user => {
            const newParticipant = document.createElement("p");
            newParticipant.className = "participant-name";
            newParticipant.id = `${user.phoneNumber}`;
            newParticipant.textContent = user.User.name;
            participantsDiv.append(newParticipant)
        })

    } catch (error) {
        handleErrorMessage(error);
    }
}


async function handleInfiniteScroll(event) {

    const chatWindow = event.target;
    const distanceFromTop = chatWindow.scrollHeight - (chatWindow.clientHeight - chatWindow.scrollTop);
    if (distanceFromTop < 50 && !isLoading) {
        isLoading = true;
        page = page + 1
        const oldScrollHeight = chatWindow.scrollHeight;
        const prevMessages = await fetchMessages(page);
        // const chatWindow = document.querySelector(".chat-window");
        prevMessages.forEach(msg => {
            if (msg.User.name === userName) {
                if (msg.isFile) {
                    chatWindow.append(createSentMessageElement(msg.content, "file"));
                } else {
                    chatWindow.append(createSentMessageElement(msg.content, "text"));
                }

            } else {
                if (msg.isFile) {
                    chatWindow.append(createReceivedMessageElement(msg.User.name, msg.content, "file"));
                } else {
                    chatWindow.append(createReceivedMessageElement(msg.User.name, msg.content, "text"));
                }
            }
        })
        const newScrollHeight = chatWindow.scrollHeight;
        chatWindow.scrollTop = newScrollHeight - oldScrollHeight + chatWindow.scrollTop;
        isLoading = false;

    }
}

async function uploadFileToS3(fileInput) {
    const file = fileInput[0];
    const fileName = file.name;
    const contentType = file.type;
    try {
        const resPreSignedUrl = await axios.post(BASE_URL + `/message/file/presignedurl`, { fileName, contentType }, { headers: { token } });
        const { message: presignedurlMessage, data: urls } = resPreSignedUrl.data;
        console.log(presignedurlMessage);
        const { fileUrl, uploadUrl } = urls;

        const uploadStatus = await axios.put(uploadUrl, file, {
            headers: {
                "Content-Type": contentType,
            }
        });
        if (uploadStatus.status !== 200) {
            throw new Error("File Uploading failed!");
            return;
        }
        return fileUrl;
    } catch (error) {
        handleErrorMessage(error);
    }
}


function handleErrorMessage(error) {
    if (error.response) {
        alert(`${error.response.data?.message || error.response.statusText}`);
        console.log(error)
    } else if (error.request) {
        console.log(`No response from server. Please check your network or server status.`);
    } else {
        console.log(`Error: ${error.message}`);
    }
}

function createReceivedMessageElement(senderName, messageContent, contentType) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "received-message-div";
    if (contentType === "text") {
        messageDiv.innerHTML = `
        <p class="sender-details">${senderName}</p>
        <p class="received-message-content">${messageContent}</p>
        `
    } else if (contentType === "file") {
        const senderDetailsEle = document.createElement("p");
        senderDetailsEle.className = "sender-details";
        senderDetailsEle.textContent = senderName;
        messageDiv.append(senderDetailsEle);

        const image = document.createElement("img");
        image.src = messageContent;
        image.alt = "Image received"
        messageDiv.append(image);
    }

    return messageDiv;
}

function createSentMessageElement(messageContent, contentType) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "sent-message-div";
    if (contentType === "text") {
        messageDiv.innerHTML = `
        <p class="sent-message-content">${messageContent}</p>
        `
    } else if (contentType === "file") {
        const image = document.createElement("img");
        image.src = messageContent;
        image.alt = "Image sent"
        messageDiv.append(image);
    }
    return messageDiv;
}
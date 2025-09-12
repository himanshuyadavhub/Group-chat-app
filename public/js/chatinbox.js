const BASE_URL = "http://localhost:3000";
const token = localStorage.getItem("token");


document.addEventListener('DOMContentLoaded', async () => {
    showContacts()
    showMessages()
})

async function messageSendingHandler(event) {
    try {
        event.preventDefault();
        const receiverPhone = localStorage.getItem("receiver");
        const messageContent = event.target.message.value.trim();
        const fileInput = event.target.mediaInput.files;

        if (!messageContent && fileInput.length < 1) {
            alert("Nothing to send!");
            return;
        }

        if (fileInput.length > 0) {
            const file = fileInput[0];
            const fileName = file.name;
            const contentType = file.type;
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

            const resSendFile = await axios.post(BASE_URL + `/message/send/file`, { fileUrl, receiverPhone }, { headers: { token } });
            const { message: sendFileMessage, data: savedFile } = resSendFile.data;
            alert(sendFileMessage);
        }



        if (messageContent) {
            const res = await axios.post(BASE_URL + `/message/send/text`, { messageContent, receiverPhone }, {
                headers: {
                    token,
                }
            });
            const { message, data } = res.data;
            alert(message);
        }


        event.target.reset();
    } catch (error) {
        handleErrorMessage(error);
    }
}


async function apiCallGetAllContacts() {
    try {
        const res = await axios.get(BASE_URL + `/user/all`, { headers: { token } });
        const { message, data: contacts } = res.data;
        return contacts;
    } catch (error) {
        handleErrorMessage(error);
    }
}

async function showContacts() {
    const contacts = await apiCallGetAllContacts();
    const contactsDiv = document.getElementById("contacts-div");
    contacts.forEach(contact => {
        const particularContact = document.createElement('div');
        particularContact.setAttribute("phoneNumber", contact.phoneNumber);
        particularContact.className = "particular-contact-div";

        const contactName = document.createElement("h4");
        contactName.textContent = contact.name;

        const contactEmail = document.createElement("p");
        contactEmail.textContent = contact.email;

        const contactPhone = document.createElement("p");
        contactPhone.textContent = contact.phoneNumber;

        particularContact.append(contactName, contactEmail, contactPhone);
        particularContact.addEventListener('click', () => setReceiversDetailsAndLoadPrevMessages(contact.phoneNumber))
        contactsDiv.appendChild(particularContact);
    });
}

function setReceiversDetailsAndLoadPrevMessages(phoneNumber) {
    localStorage.setItem("receiver", phoneNumber);
    showMessages();
}

async function showMessages() {
    const phoneNumber = localStorage.getItem("receiver");
    const prevChatDiv = document.getElementById("prev-chat-div");
    if (phoneNumber) {
        const prevMessages = await apiCallGetPrevMessages(phoneNumber);
        prevChatDiv.innerHTML = "";
        prevMessages.forEach(message => {
            particularMessage = document.createElement("div");
            if (message.from === phoneNumber) {
                particularMessage.className = "received-message-div";
            } else {
                particularMessage.className = "sent-message-div";
            }
            particularMessage.textContent = message.content;
            prevChatDiv.appendChild(particularMessage);
        })
    } else {
        prevChatDiv.innerHTML = "Messages will be here!"
    }
}

async function apiCallGetPrevMessages(phoneNumber) {
    try {
        const res = await axios.get(BASE_URL + `/message/previous?receiverPhone=${phoneNumber}`, { headers: { token } });
        const { message, data: prevMessages } = res.data;
        return prevMessages;
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
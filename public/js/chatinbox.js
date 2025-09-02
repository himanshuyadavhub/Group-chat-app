const BASE_URL= "http://localhost:3000";
const token= localStorage.getItem("token");

async function messageSendingHandler(){
    try {
        const messageContent= document.getElementById("message").value.trim();
        const res= await axios.post(BASE_URL + `/message/send`, {messageContent}, {headers:{token}});
        const {message, data}= res.data;
        console.log(data)
        alert(message);
    } catch (error) {
        handleErrorMessage(error);
    }
}

document.addEventListener('DOMContentLoaded', async()=>{
    try {
        const res= await axios.get(BASE_URL + `/message/previous`, {headers:{token}});
        const {message, data:prevMessages}= res.data;
        alert(message);
    } catch (error) {
        handleErrorMessage(error);
    }
})

function handleErrorMessage(error) {
    if (error.response) {
        alert(`${error.response.data?.message || error.response.statusText}`);
    } else if (error.request) {
        console.log(`No response from server. Please check your network or server status.`);
    } else {
        console.log(`Error: ${error.message}`);
    }
}
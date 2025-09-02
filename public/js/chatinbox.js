const BASE_URL= "http://localhost:3000";
const token= localStorage.getItem("token");

async function messageSendingHandler(){
    const messageContent= document.getElementById("message").value.trim();
    const res= await axios.post(BASE_URL + `/message/send`, {messageContent}, {headers:{token}});
    const {message, data}= res.data;
    console.log(data)
    alert(message);
}
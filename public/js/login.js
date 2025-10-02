const BASE_URL= "http://localhost:3000"

async function handleLoginFormSubmit(event){
    event.preventDefault();
    const email= event.target.email.value.trim();
    const password= event.target.password.value;

    try {
        const res= await axios.post(BASE_URL + `/user/login`, {email, password});
        const {message, data}= res.data;
        localStorage.setItem("token", data.jwtToken);
        localStorage.setItem("userName", data.userName);

        alert("login successfull")
        window.location.href= BASE_URL+ "/message/inbox"

    } catch (error) {
        handleErrorMessage(error);
    }
}

async function handleSignupBtn(){
    try {
        window.location.href = BASE_URL + `/user/signup`;
    } catch (error) {
        handleErrorMessage(error);
    }
}

function handleErrorMessage(error) {
    if (error.response) {
        alert(`${error.response.data?.message || error.response.statusText}`);
    } else if (error.request) {
        console.log(`No response from server. Please check your network or server status.`);
    } else {
        console.log(`Error: ${error.message}`);
    }
}
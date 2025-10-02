const BASE_URL = "http://localhost:3000"

async function handleSignupFormSubmit(event) {
    event.preventDefault();
    const name = event.target.name.value.trim();
    const email = event.target.email.value.trim();
    const phoneNumber = event.target.phonenumber.value.trim();
    const password = event.target.password.value;
    const confirmPassword = event.target.confirmPassword.value;
    if (password !== confirmPassword) {
        alert("Password does not match!");
        return;
    }
    try {
        const res = await axios.post(BASE_URL + `/user/signup`, { name, email, phoneNumber, password, confirmPassword });
        const { message, data } = res.data;
        alert(message);
        event.target.reset();

        return
    } catch (error) {
        handleErrorMessage(error)
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
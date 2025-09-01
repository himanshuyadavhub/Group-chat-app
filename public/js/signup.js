const BASE_URL= "http://localhost:3000"

async function handleSignupFormSubmit(event){
    event.preventDefault();
    const name= event.target.name.value.trim();
    const email= event.target.email.value.trim();
    const phoneNumber= event.target.phonenumber.value.trim();
    const password= event.target.password.value;
    const confirmPassword= event.target.confirmPassword.value;

    const res= await axios.post(BASE_URL + `/user/signup`, {name, email, phoneNumber, password, confirmPassword});
    const {message, data} = res.data;
    console.log("message", message);
    console.log("data", data);
}
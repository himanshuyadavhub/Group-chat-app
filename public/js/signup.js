
function handleSignupFormSubmit(event){
    event.preventDefault();
    const name= event.target.name.value.trim();
    const email= event.target.email.value.trim();
    const phoneNum= event.target.phonenumber.value.trim();
    const password= event.target.password.value;
    const confirmPassword= event.target.confirmPassword.value;

    console.log(`${name}, ${email}, ${phoneNum}, ${password}, ${confirmPassword}`);
}
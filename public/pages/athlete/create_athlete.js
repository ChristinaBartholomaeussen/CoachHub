

document.getElementById("createAthleteForm").addEventListener("submit", e => {
    e.preventDefault();

    if(validatePassword() === true) {
        createNewAthlete();
    }
   
});


function validatePassword() {

    if(document.getElementById("password").value !== document.getElementById("password1").value) {
        const wrongPassword = toastr.warning({
            timeOut: 0
        });

        wrongPassword.find(".toast-message").text("De indtastede passwords stemmer ikke overens.");
        return false;
    }

    return true;
}

function createNewAthlete() {

    fetch("/athlete", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            first_name: document.getElementById("firstName").value,
            last_name: document.getElementById("lastName").value,
            date_of_birth: document.getElementById("dateOfBirth").value,
            gender: document.getElementById("gender").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            phone: document.getElementById("phone").value
            
        })
    }).then(response => {

        if(response.status === 201) {
            
            const success = toastr.success({
                timeOut: 0
            });
            document.getElementById("createAthleteForm").reset();
            success.find(".toast-message").text("Tillykke, du er nu oprettet. Vi har sendt dig en mail, du skal bekræfte.");
        }

        else if(response.status === 400) {
            const error = toastr.error({
                timeOut: 0
            })
            error.find(".toast-message").text("Den indtastede mail eksisterer allerede.")
        }
    });
}
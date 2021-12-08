

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

    fetch("/athletes", {
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


        switch(response.status) {

            case 201:
                toastr.success("Tillykke, du er nu oprettet. Vi har sendt dig en mail, du skal bekræfte.")
            setTimeout(() => location.href = "/", 3000);
            break;

            case 409:
                toastr.error("Den indtastede mail eksisterer allerede.")
                break;

        }

    });
}
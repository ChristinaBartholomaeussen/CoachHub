const termsModal = new bootstrap.Modal(document.getElementById("termsModal"), {
    keyboard: false,
    backdrop: 'static'
});

document.getElementById("termsBtn").addEventListener("click", () => {
    termsModal.show();
});


document.getElementById("close").addEventListener("click", () => {
    if (document.getElementById("confirmTerms").checked) {

        document.getElementById("isConfirmed").checked = true;
        termsModal.hide();

    } else {
        toastr.error("Du skal accepterer betingelserne, før du kan fortsætte.");
    }
});

document.getElementById("createAthleteForm").addEventListener("submit", e => {
    e.preventDefault();

    if (validateForm() === true && document.getElementById("isConfirmed").checked) {
        createNewAthlete();
    } else if (!document.getElementById("isConfirmed").checked) {
        toastr.error("Du skal acceptere betingelserne, før du kan fortsætte.");
    }

});

const regNumber = /^\d+$/;
const regEmail = /\S+@\S+\.\S+/;

function validateForm() {

    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const password1 = document.getElementById("password1").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;

    if (firstName.trim().length === 0 || lastName.trim().length === 0 || username.trim().length === 0 || password.trim().length === 0 ||
        password1.trim().length === 0 || email.trim().length === 0 || phone.trim().length === 0) {

        toastr.warning("Udfyld venligst alle felter.");
        return false;
    }
    else if (password !== password1) {

        toastr.warning("De indtastede passwords stemmer ikke overens.");
        return false;

    } else if (regEmail.test(email) === false) {

        toastr.warning("Indtast venligst en gyldig email.");
        return false;

    } else if (regNumber.test(phone) === false) {

        toastr.warning("Indtast venligst et gyldigt telefonnummer.");
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
            username: document.getElementById("username").value,
            date_of_birth: document.getElementById("dateOfBirth").value,
            gender: document.getElementById("gender").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            phone: document.getElementById("phone").value

        })
    }).then(response => {

        switch (response.status) {

            case 201:
                toastr.success("Tillykke, du er nu oprettet. Vi har sendt dig en mail, du skal bekræfte.")
                setTimeout(() => location.href = "/", 5000);
                break;

            case 409:
                toastr.warning("Der findes allerede en bruger med den valgte email eller brugernavn.");
                break;

            case 500:
                toastr.error("Der skete en fejl. Prøv igen senere");
                break;

        }
    });
}
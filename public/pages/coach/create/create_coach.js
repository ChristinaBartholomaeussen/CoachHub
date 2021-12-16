document.getElementById("commercialCoach").addEventListener("click", showCommercial);
document.getElementById("privateCoach").addEventListener("click", showPrivate);

function showPrivate() {
    document.getElementById("privateCoachTemplate").style.display = "block";
    document.getElementById("commercialCoachTemplate").style.display = "none";
}

function showCommercial() {

    document.getElementById("commercialCoachTemplate").style.display = "block";
    document.getElementById("privateCoachTemplate").style.display = "none";

}

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

document.getElementById("submitPrivate").addEventListener("click", () => {

    if (validatePrivateForm()) {
        postNewCoach();
    }
})

document.getElementById("submitCommercial").addEventListener("click", () => {

    if (validateCommercialForm()) {
        postNewCoach();
    }

});

const regNumber = /^\d+$/;
const regEmail = /\S+@\S+\.\S+/;

function validatePrivateForm() {

    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const streetName = document.getElementById("streetNameP").value;
    const postalCode = document.getElementById("postalCodeP").value;
    const email = document.getElementById("emailP").value;
    const houseNumber = document.getElementById("houseNumberP").value;
    const password = document.getElementById("passwordP").value;
    const password2 = document.getElementById("passwordP1").value;
    const username = document.getElementById("usernameP").value;
    const phone = document.getElementById("phoneP").value;

    if (firstName.trim().length === 0 || lastName.trim().length === 0 || streetName.trim().length === 0 || 
    postalCode.trim().length === 0 || email.trim().length === 0 || houseNumber.trim().length === 0 || 
    password.trim().length === 0 || password2.trim().length === 0 || username.trim().length === 0 ||
    phone.trim().length === 0) {

        toastr.warning("Udfyld venligst alle felter");
        return false;

    } else if (password !== password2) {

        toastr.warning("De indtastede passwords stemmer ikke overens.");

        return false;

    } else if (postalCode.length !== 4 ||
        regNumber.test(postalCode) === false) {

        toastr.warning("Indtast venligst et gyldigt postnummer.");
        return false;

    } else if (phone.length !== 8 ||
        regNumber.test(phone) === false) {

        toastr.warning("Indtast venligst et gyldigt telefonnummer.");
        return false;

    } else if (regEmail.test(email) === false) {

        toastr.warning("Indtast venligst en gyldig emailadresse.");
        return false;

    } else if (!isConfirmed.checked) {

        toastr.warning("Du skal acceptere betingelserne, før du kan fortsætte.");
        return false;
    }

    return true;
}


function validateCommercialForm() {

    const companyName = document.getElementById("companyName").value;
    const cvrNumber = document.getElementById("cvr").value;
    const streetName = document.getElementById("streetNameC").value;
    const postalCode = document.getElementById("postalCodeC").value;
    const email = document.getElementById("emailC").value;
    const houseNumber = document.getElementById("houseNumberC").value;
    const password = document.getElementById("passwordC").value;
    const password2 = document.getElementById("passwordC1").value;
    const username = document.getElementById("usernameC").value;
    const phone = document.getElementById("phoneC").value;
    
    if (companyName.trim().length === 0 || cvrNumber.trim().length === 0 || streetName.trim().length === 0 || 
    postalCode.trim().length === 0 || email.trim().length === 0 || houseNumber.trim().length === 0 || 
    password.trim().length === 0 || password2.trim().length === 0 || username.trim().length === 0 ||
    phone.trim().length === 0) {

        toastr.warning("Udfyld venligst alle felter");
        return false;

    } else if (password !== password2) {

        toastr.warning("De indtastede passwords stemmer ikke overens.");
        return false;

    } else if (postalCode.length !== 4 ||
        regNumber.test(postalCode) === false) {

        toastr.warning("Indtast venligst et gyldigt postnummer.");
        return false;

    } else if (phone.length !== 8 ||
        regNumber.test(phone) === false) {

        toastr.warning("Indtast venligst et gyldigt telefonnummer.");
        return false;

    } else if (regEmail.test(email) === false) {

        toastr.warning("Indtast venligst en gyldig emailadresse.");
        return false;

    } else if (!isConfirmed.checked) {

        toastr.warning("Du skal acceptere betingelserne, før du kan fortsætte.");
        return false;

    } 

    return true;
}


function postNewCoach() {

    let JSONbody;

    if (document.getElementById("privateCoach").checked) {
        JSONbody = JSON.stringify({
            coach_type: 1,
            first_name: document.getElementById("firstName").value,
            last_name: document.getElementById("lastName").value,
            username: document.getElementById("usernameP").value,
            street_name: document.getElementById("streetNameP").value,
            number: document.getElementById("houseNumberP").value,
            postal_code: document.getElementById("postalCodeP").value,
            email: document.getElementById("emailP").value,
            phone: document.getElementById("phoneP").value,
            password: document.getElementById("passwordP").value,
        })
    } else {

        JSONbody = JSON.stringify({
            coach_type: 2,
            company_name: document.getElementById("companyName").value,
            cvr_number: document.getElementById("cvr").value,
            username: document.getElementById("usernameC").value,
            street_name: document.getElementById("streetNameC").value,
            number: document.getElementById("houseNumberC").value,
            postal_code: document.getElementById("postalCodeC").value,
            email: document.getElementById("emailC").value,
            phone: document.getElementById("phoneC").value,
            password: document.getElementById("passwordC").value,
        })
    }

    fetch("/coachs", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSONbody
    }).then(response => {

        switch (response.status) {

            case 200:
                toastr.success("Tillykke, du er nu oprettet. Din profil er sendt til godkendelse hos en administrator");
                setTimeout(() => location.href = "/", 5000);
                break;

            case 400:
                toastr.warning("Det indtastede postnummer findes ikke.");
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

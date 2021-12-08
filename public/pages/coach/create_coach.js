function showPrivate() {
    document.getElementById("privateCoachTemplate").style.display = "block";
    document.getElementById("commercialCoachTemplate").style.display = "none";
}

function showCommercial() {

    document.getElementById("commercialCoachTemplate").style.display = "block";
    document.getElementById("privateCoachTemplate").style.display = "none";

}



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

    if (document.getElementById("firstName").value === '' || document.getElementById("lastName").value === '' ||
        document.getElementById("streetNameP").value === '' || document.getElementById("postalCodeP").value === '' ||
        document.getElementById("emailP").value === '' || document.getElementById("passwordP").value === '' ||
        document.getElementById("houseNumberP").value === '') {

        toastr.warning("Udfyld venligst alle felter");
        return false;

    } else if (document.getElementById("passwordP").value !== document.getElementById("passwordP1").value) {

        toastr.warning("De indtastede passwords stemmer ikke overens.");

        return false;

    } else if (document.getElementById("postalCodeP").value.length !== 4 ||
        regNumber.test(document.getElementById("postalCodeP").value) === false) {

        toastr.warning("Indtast venligst et gyldigt postnummer.");
        return false;

    } else if (document.getElementById("phoneP").value.length !== 8 ||
        regNumber.test(document.getElementById("phoneP").value) === false) {

        toastr.warning("Indtast venligst et gyldigt telefonnummer.");
        return false;

    } else if (regEmail.test(document.getElementById("emailP").value) === false) {

        toastr.warning("Indtast venligst en gyldig emailadresse.");
        return false;
    }

    return true;
}


function validateCommercialForm() {

    if (document.getElementById("companyName").value === '' || document.getElementById("cvr").value === '' ||
        document.getElementById("streetNameC").value === '' || document.getElementById("postalCodeC").value === '' ||
        document.getElementById("emailC").value === '' || document.getElementById("passwordC").value === '' ||
        document.getElementById("houseNumberC").value === '') {

        toastr.warning("Udfyld venligst alle felter");
        return false;

    } else if (document.getElementById("passwordC").value !== document.getElementById("passwordC1").value) {

        toastr.warning("De indtastede passwords stemmer ikke overens.");

        return false;

    } else if (document.getElementById("postalCodeC").value.length !== 4 ||
        regNumber.test(document.getElementById("postalCodeC").value) === false) {

        toastr.warning("Indtast venligst et gyldigt postnummer.");
        return false;

    } else if (document.getElementById("phoneC").value.length !== 8 ||
        regNumber.test(document.getElementById("phoneC").value) === false) {

        toastr.warning("Indtast venligst et gyldigt telefonnummer.");
        return false;

    } else if (regEmail.test(document.getElementById("emailC").value) === false) {

        toastr.warning("Indtast venligst en gyldig emailadresse.");
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
                toastr.error("Der findes allerede en bruger med den valgte email.");
                break;

            case 500:
                toastr.error("Der skete en fejl. Prøv igen senere");
                break;
        }

    })






}

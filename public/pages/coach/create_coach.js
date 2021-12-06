function showPrivate() {
    document.getElementById("privateCoachTemplate").style.display = "block";
    document.getElementById("commercialCoachTemplate").style.display = "none";
}

function showCommercial() {

    document.getElementById("commercialCoachTemplate").style.display = "block";
    document.getElementById("privateCoachTemplate").style.display = "none";
    
}

document.getElementById("submitPrivate").addEventListener("click", () => {
    
    if(validatePassword()) {
        postNewCoach();
    }
})

document.getElementById("submitCommercial").addEventListener("click", () => {

    if(validatePassword()) {
        postNewCoach();
    }

});


function validatePassword() {

    /*if(document.getElementById("passwordC").value !== document.getElementById("passwordC1").value ||
    document.getElementById("passwordP").value !== document.getElementById("passwordP1").value) {
        
            const wrongPassword = toastr.warning({
            timeOut: 0
        });

        wrongPassword.find(".toast-message").text("De indtastede passwords stemmer ikke overens.");
        return false;
    }*/

    return true;
}


function postNewCoach() {

    let JSONbody; 

    if(document.getElementById("privateCoach").checked) {
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
    } else{

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

    fetch("/coach", {
        method: "POST", 
        headers: {
            "Content-type": "application/json"
        },
        body: JSONbody
    }).then(response => {
        if(response.status === 200) {
            console.log("helloo")
        }
    })
   


    


}

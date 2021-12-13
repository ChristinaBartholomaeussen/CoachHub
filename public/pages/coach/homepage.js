
const myForm = document.getElementById("myForm");

fetch("/coachs/api")
    .then(response => response.json())
    .then(({ coachs }) => {

        coachs.map(coach => {

            console.log(coach["company_name"])

            if (coach["coach_type_id"] === 1) {
                myForm.value = 1;
                document.getElementById("firstNameCompanyName").value = coach["first_name"];
                document.getElementById("cvrLastName").value = coach["last_name"];
            }
            else if (coach["coach_type_id"] === 2) {
                myForm.value = 2;
                document.getElementById("firstNameCompanyName").value = coach["company_name"];
                document.getElementById("cvrLastName").value = coach["cvr_number"];
            }

            document.getElementById("email").value = coach["email"];
            document.getElementById("phone").value = coach["phone_number"];
            document.getElementById("streetName").value = coach["street_name"];
            document.getElementById("number").value = coach["number"];
            document.getElementById("city").value = coach["city_name"];
            document.getElementById("postalCode").value = coach["postal_code"];

        });


    });



myForm.addEventListener("keyup", () => {
    document.getElementById("save").disabled = false;
});

const regNumber = /^\d+$/;

myForm.addEventListener("submit", (e) => {
    e.preventDefault();


    if (regNumber.test(document.getElementById("phone").value) !== true) {
        toastr.error("Indtast venligst et gyldigt telefonnummer.");
    } else if (regNumber.test(document.getElementById("postalCode").value) !== true) {
        toastr.error("Indtast venligst et gyldigt postnummer.");
    }
    else {
        updateInfo();
    }

});


function updateInfo() {

    let JSONbody;

    if (myForm.value === 1) {
        JSONbody = JSON.stringify({
            coach_type_id: 1,
            first_name: document.getElementById("firstNameCompanyName").value,
            last_name: document.getElementById("cvrLastName").value,
            email: document.getElementById("email").value,
            phone_number: document.getElementById("phone").value,
            street_name: document.getElementById("streetName").value,
            number: document.getElementById("number").value,
            city: document.getElementById("city").value,
            postal_code: document.getElementById("postalCode").value
        })
    } else {
        JSONbody = JSON.stringify({
            coach_type: 2, 
            company_name: document.getElementById("firstNameCompanyName").value,
            cvr_number: document.getElementById("cvrLastName").value,
            email: document.getElementById("email").value,
            phone_number: document.getElementById("phone").value,
            street_name: document.getElementById("streetName").value,
            number: document.getElementById("number").value,
            city: document.getElementById("city").value,
            postal_code: document.getElementById("postalCode").value
        })
    }

    fetch("/coachs", {
        method: "PATCH",
        headers: {
            "Content-type": "application/json"
        },
        body: JSONbody
    }).then(response => {

        switch (response.status) {

            case 200:
                toastr.success("Dine ændringer er blevet gemt.");
                break;

            case 400:
                toastr.warning("Tjek venligst dine oplysninger.");
                break;

            case 500:
                toastr.error("Der skete en fejl. Prøv igen senere.");
                break;
        }
    });
}


document.getElementById("delete").addEventListener("click", () => {

    const confirmBox = confirm("Er du sikker på, at du vil slette din profil?");

    if (confirmBox) {
        deleteUser();
    }
});


function deleteUser() {
    fetch("/coachs", {
        method: "DELETE",
        headers: {
            "Content-type": "application/json"
        }
    }).then(response => {

        switch (response.status) {
            case 200:
                toastr.success("Din bruger er blevet slettet.");
                setTimeout(() => location.href = "/logout", 3000);
                break;
            case 500:
                toastr.error("Der skete en fejl. Prøv igen senere.");
                break;
        }

    })
}




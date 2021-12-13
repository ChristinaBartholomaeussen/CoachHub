

fetch("/athletes/api")
    .then(response => response.json())
    .then(({ users }) => {

        users.map(user => {

            document.getElementById("firstName").value = user["first_name"];
            document.getElementById("lastName").value = user["last_name"];

            var dayOfBirth = new Date(user["date_of_birth"]);

            year = dayOfBirth.getFullYear();
            month = (dayOfBirth.getMonth() + 1).toString().padStart(2, "0");
            day = dayOfBirth.getDate().toString().padStart(2, "0");

            document.getElementById("dateOfBirth").value = `${year}-${month}-${day}`;

            document.getElementById("email").value = user["email"];
            document.getElementById("phone").value = user["phone_number"];

        });


    });

const myForm = document.getElementById("myForm");

myForm.addEventListener("keyup", () => {
    document.getElementById("save").disabled = false;
});

const regNumber = /^\d+$/;

myForm.addEventListener("submit", (e) => {
    e.preventDefault();


    if (regNumber.test(document.getElementById("phone").value) !== true) {
        toastr.error("Indtast venligst et gyldigt telefonnummer.");
    } else {
        updateInfo();
    }

});

function updateInfo() {

    fetch("/athletes", {
        method: "PATCH",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            email: document.getElementById("email").value,
            first_name: document.getElementById("firstName").value,
            last_name: document.getElementById("lastName").value,
            phone_number: document.getElementById("phone").value,
            date_of_birth: document.getElementById("dateOfBirth").value,
        })
    }).then(response => {

        switch (response.status) {

            case 200:
                toastr.success("Dine ændringer er blevet gemt.");
                break;

            case 400:
                toastr.warning("Tjek venligst dine oplysninger.");
                break;

            case 409:
                toastr.error("Email eksisterer allerede.");
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
    fetch("/athletes", {
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
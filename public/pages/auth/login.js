
document.getElementById("formLogin").addEventListener("submit", e => {
    e.preventDefault();
    confirmLogin();
})

function confirmLogin() {

    fetch("/login", {
        method: "POST",
        headers: {

            "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        })
    }).then(response => {

        console.log(response.status);
        switch (response.status) {

            case 200:
                response.json().then(data => {

                    console.log(data);

                    switch (data["user"]["role_id"]) {
                        case 1:
                            location.href = "/admin";
                            break;
                        case 2:
                            location.href = "/coach";
                            break;
                        case 3:
                            location.href = "/athlete";
                            break;
                    }
                });
                break;

            case 400:
                const error = toastr.error({
                    timeOut: 0
                });

                error.find(".toast-message").text("Du skal bekræfte din mail før du kan logge ind.");
                break;

            case 401:
                const badCridentials = toastr.error({
                    timeOut: 0
                });

                badCridentials.find(".toast-message").text("De indtastede oplysninger matcher ikke.");
                break;

            case 404:
                const notFound = toastr.error({
                    timeOut: 0
                })
                document.getElementById("formLogin").reset();
                notFound.find(".toast-message").text("Du skal oprette dig, før du kan logge ind.");
                break;


        }
    });
}

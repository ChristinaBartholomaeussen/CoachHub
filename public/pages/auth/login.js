
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

        switch (response.status) {

            case 200:
                response.json().then(data => {
                    
                    switch (data["role"]) {
                        case 1:
                            location.href = "/admin";
                            break;
                        case 2:
                            location.href = "/coachs";
                            break;
                        case 3:
                            location.href = `/athletes`;
                            break;
                    }
                });
                break;

            case 400:

                response.json().then(data => {

                    switch (data["role"]) {
                        case 2:
                            toastr.error("En administrator har endnu ikke godkendt din profil.");
                            break;

                        case 3:
                            toastr.error("Du skal bekræfte din profil, inden du kan logge ind.");
                            break;
                    }

                });

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

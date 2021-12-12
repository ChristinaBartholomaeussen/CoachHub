const mymodal = new bootstrap.Modal(document.getElementById("newSession"), {
    keyboard: false,
    backdrop: 'static'
});

document.getElementById("addAvaiable").addEventListener("click", () => {
    mymodal.show();
});


document.getElementById("close").addEventListener("click", () => {
    document.getElementById("myForm").reset();
    mymodal.hide();
});

document.getElementById("save").addEventListener("click", () => {

    if (validateForm()) {
        saveSession();
    }

});


fetch("/coachs/api/training-session")
    .then(response => response.json())
    .then(({ training_sesssions }) => {

        const sessionWrapper = document.getElementById("avaiable-sessions-wrapper");


        training_sesssions.map(session => {

            console.log(session)

            const item = document.createElement("li");
            item.classList.add("list-group-item");
            item.classList.add("d-flex");
            item.classList.add("align-items-center");
            item.classList.add("justify-content-between");
            item.classList.add("mt-1");

            const dateString = session["date"].split('T');
            const dateStringArr = dateString[0].split('-');

            const start = session["start"].split(':');
            const end = session["end"].split(':');

            const text = document.createElement("p");
            text.innerHTML = `<strong>Dato: </strong>${dateStringArr[2]}-${dateStringArr[1]}-${dateStringArr[0]}
        <b>Start: </b>  ${start[0]}:${start[1]}
        <b>Slut: </b>  ${end[0]}:${end[1]}
        <b>Titel: </b>  ${session["title"]}`;
            item.append(text);


            const h3 = document.createElement("p");
            h3.classList.add("ms-auto");
            const icon = document.createElement("i");
            icon.classList.add("bi");
            icon.classList.add("bi-trash-fill");
            icon.setAttribute("type", "button");
            icon.addEventListener("click", () => {
                const confirmDelete = confirm("Du er ved at slette en ledig træningssession");
                if (confirmDelete) {
                    deleteSession(session["session_id"], item);
                }
            })
            h3.append(icon);
            item.append(h3);
            sessionWrapper.append(item);
        });
    });



function saveSession() {

    fetch("/coachs/training-sessions", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({
            service_id: document.getElementById("selectService").value,
            date: document.getElementById("date").value,
            start: document.getElementById("start").value,
            end: document.getElementById("end").value
        })
    }).then(response => {

        switch (response.status) {

            case 201:
                toastr.success("Din træning er blevet gemt.");
                document.getElementById("myForm").reset();
                setTimeout(() => mymodal.hide(), 3000);
                break;

            case 400:
                toastr.warning("Dobbeltjek din oprettelse.");
                break;

            case 500:
                toastr.error("Der skete en fejl. Prøv igen senere.");
                break;

        }
    })
}

function validateForm() {

    const selectedService = document.getElementById("selectService").value;
    const date = document.getElementById("date").value;
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;

    if (selectedService === '' || date === '' || start === '' || end === '') {
        toastr.warning("Udfyld venligst alle felter.")
        return false;
    } else if (new Date(date) < new Date()) {
        toastr.warning("Dato må ikke være før nuværende dato.")
        return false;
    } else if (start > end) {
        toastr.warning("Starttidspunktet skal være før sluttidspunktet.")
        return false;
    }

    return true;
}


fetch("/coachs/api/services")
    .then(response => response.json())
    .then(({ services }) => {

        const serviceList = document.getElementById("selectService");

        services.map(service => {
            const serviceItem = document.createElement("option");
            serviceItem.value = service["service_id"];
            serviceItem.innerText = service["title"];
            serviceList.append(serviceItem);
        });
    });


function deleteSession(sessionId, cardDiv) {

    fetch(`/coachs/training-sessions/${sessionId}`, {
        method: "DELETE",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then(response => {
        const sessionWrapper = document.getElementById("avaiable-sessions-wrapper");
        switch (response.status) {
            case 200:
                toastr.success("Fuldført.");
                sessionWrapper.removeChild(cardDiv);
                break;

            case 500:
                toastr.error("Der skete en fejl. Prøv igen senere");
                break;
        }
    })

}


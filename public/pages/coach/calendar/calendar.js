
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

const pendingBookingsModal = new bootstrap.Modal(document.getElementById("pendingBookingsModal"));

fetch("/coachs/training-sessions")
    .then(response => response.json())
    .then(({ training_sesssions }) => {

        const sessionWrapper = document.getElementById("avaiable-sessions-wrapper");

        training_sesssions.map(session => {

            const item = document.createElement("li");
            item.classList.add("list-group-item", "d-flex", "align-items-center", "justify-content-between", "mt-1");

            const dateString = session["date"].split('T');
            const dateStringArr = dateString[0].split('-');

            const start = session["start"].split(':');
            const end = session["end"].split(':');

            const text = document.createElement("p");
            text.innerHTML = `<strong>Dato: </strong>${escapeHTML(dateStringArr[2])}-${escapeHTML(dateStringArr[1])}-${escapeHTML(dateStringArr[0])}
        <b>Start: </b>  ${escapeHTML(start[0])}:${escapeHTML(start[1])}
        <b>Slut: </b>  ${escapeHTML(end[0])}:${escapeHTML(end[1])}
        <b>Titel: </b>  ${escapeHTML(session["title"])}`;
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
    });
};

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

fetch("/coachs/services")
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
    });
}

document.getElementById("pendingBookingsCountBtn").addEventListener("click", () => {
    pendingBookingsModal.show();
});

fetch("/coachs/bookings")
    .then(response => response.json())
    .then(({ bookings }) => {

        const bookingWrapper = document.getElementById("booking-wrapper");
        const pendingBookingsCount = document.getElementById("pendingBookingsCountBtn");
        const endedBookingsWrapper = document.getElementById("ended-bookings-wrapper");
        const pendingBookingsWrapper = document.getElementById("pending-bookings-modal-list");

        const upCommingBookings = bookings.filter(booking => new Date(booking["booking_date"]) > Date.now())
            .sort((bookingA, bookingB) => new Date(bookingA["booking_date"]) - new Date(bookingB["booking_date"]));

           

        let count = 0;

        bookings.map(booking => {

            if (booking["isConfirmed"] === 0) {
                count += 1;

                const li = document.createElement("li");
                li.id = booking["session_id"];
                li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

                const bookingDate = new Date(booking["booking_date"]);

                const year = bookingDate.getFullYear();
                const month = (bookingDate.getMonth() + 1).toString().padStart(2, "0");
                const day = bookingDate.getDate().toString().padStart(2, "0");

                li.innerHTML = `<b>Dato:</b> ${day}-${month}-${year} <br>  
                <b>Tidsrum</b> ${escapeHTML(booking["booking_start"])}-${escapeHTML(booking["booking_end"])} <br>
                <b>Service:</b> ${escapeHTML(booking["title"])}`;

                const acceptBtn = document.createElement("button");
                acceptBtn.classList.add("btn", "btn-success");
                const acceptIcon = document.createElement("i");
                acceptIcon.classList.add("bi", "bi-check-lg");
                acceptBtn.append(acceptIcon);
                acceptBtn.addEventListener("click", acceptBooking);
                acceptBtn.bookingId = booking["session_id"];
                acceptBtn.email = booking["email"];
                acceptBtn.firstName = booking["first_name"];
                acceptBtn.lastName = booking["last_name"];
                acceptBtn.gender = booking["gender"];
                acceptBtn.phone = booking["phone_number"];
                li.append(acceptBtn);

                const rejectBtn = document.createElement("button");
                rejectBtn.classList.add("btn", "btn-danger");
                const rejectIcon = document.createElement("i");
                rejectIcon.classList.add("bi", "bi-x-lg");
                rejectBtn.append(rejectIcon);
                rejectBtn.addEventListener("click", rejectBooking, false);
                rejectBtn.bookingId = booking["session_id"];

                li.append(rejectBtn);

                pendingBookingsWrapper.append(li);

            } else {

                const li = document.createElement("li");
                li.classList.add("list-group-item");

                const bookingDate = new Date(booking["booking_date"]);

                const year = bookingDate.getFullYear();
                const month = (bookingDate.getMonth() + 1).toString().padStart(2, "0");
                const day = bookingDate.getDate().toString().padStart(2, "0");

                const start = booking["booking_start"].substring(0, 5);
                const end = booking["booking_end"].substring(0, 5);

                li.innerHTML = `<b>Dato:</b> ${day}-${month}-${year} <br>  
                <b>Tidsrum</b> ${escapeHTML(start)}-${escapeHTML(end)} <br>
                <b>Service:</b> ${escapeHTML(booking["title"])}`;

                if(!upCommingBookings.includes(booking)) {
                    endedBookingsWrapper.append(li);
                } else {
                    bookingWrapper.append(li);
                }
  
            }
            pendingBookingsCount.innerText = count;
        });
    });


function acceptBooking(e) {

    const child = e.currentTarget.bookingId;
    let genderValue;

    if (e.currentTarget.gender === "1") {
        genderValue = "Kvinde"
    } else {
        genderValue = "Mand"
    }

    fetch(`/coachs/bookings/${e.currentTarget.bookingId}`, {
        method: "PATCH",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({
            email: e.currentTarget.email,
            first_name: e.currentTarget.firstName,
            last_name: e.currentTarget.lastName,
            gender: genderValue,
            phone_number: e.currentTarget.phone
        })
    }).then(response => {

        const pendingBookingsWrapper = document.getElementById("pending-bookings-modal-list");

        switch (response.status) {
            case 200:
                toastr.success("Bookingen er bekræftet. Du modtager en mail med oplysningerne på sportsudøveren.")
                const li = document.getElementById(child);
                pendingBookingsWrapper.removeChild(li);
                pendingBookingsModal.hide();
                setTimeout(() => {
                    location.reload(true);
                }, 3000);
                break;

            case 500:
                toastr.error("Der skete en fejl. Prøv igen senere.");
                break;
        }
    });
}

function rejectBooking(e) {

    const child = e.currentTarget.bookingId;

    fetch(`/coachs/bookings/${e.currentTarget.bookingId}`, {
        method: "DELETE",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then(response => {

        const pendingBookingsWrapper = document.getElementById("pending-bookings-modal-list");

        switch (response.status) {
            case 200:
                const li = document.getElementById(child);
                pendingBookingsWrapper.removeChild(li);
                break;

            case 500:
                toastr.error("Der skete en fejl. Prøv igen senere.");
                break;
        }
    });
};
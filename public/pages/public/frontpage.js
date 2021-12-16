

const readMoreModal = new bootstrap.Modal(document.getElementById("readMoreModal"));
const avaiableSessions = new bootstrap.Modal(document.getElementById("avaiableSessions"));

const collapseDiv = document.getElementById("searchArea")

var bsCollapse = new bootstrap.Collapse(collapseDiv, {
    toggle: false
});

const searchBtn = document.getElementById("btnSearch");

document.getElementById("searchValue").addEventListener("keyup", () => {
    document.getElementById("city-wrapper").innerText = '';
    document.getElementById("service-wrapper").innerText = '';
    searchBtn.addEventListener("click", search);
    bsCollapse.hide();
});

function search() {

    const searchValue = document.getElementById("searchValue").value;

    if (searchValue === '') {
        
    } else {
        fetch(`/services?sport=${searchValue}`)
            .then(response => response.json())
            .then(({ services }) => {

                if (Object.entries(services).length === 0) {
                    document.getElementById("header").innerText = "Ingen trænere tilbyder træning inden for denne sportsgren.";
                } else {

                    document.getElementById("header").innerText = "Trænere i følgende byer tilbyder træning, inden for denne sportsgren.";
                    const cityWrapper = document.getElementById("city-wrapper");

                    const uniqueSet = [...new Set(services.map(service => service["city_name"]))];

                    uniqueSet.map(city => {

                        const cityDiv = document.createElement("div");
                        cityDiv.classList.add("form-check");
                        cityWrapper.append(cityDiv);

                        const cityCheckbox = document.createElement("input");
                        cityCheckbox.setAttribute("type", "checkbox");
                        cityCheckbox.classList.add("form-check-input");
                        cityCheckbox.value = city;
                        cityCheckbox.onchange = () => {

                            if (cityCheckbox.checked) {

                                const temp = services;
                                const add = temp.filter(service => cityCheckbox.value === service["city_name"]);
                                showServices(add);

                            } else {
                                const temp = services;
                                const remove = temp.filter(service => cityCheckbox.value === service["city_name"]);
                                removeService(remove);
                            }

                        }
                        cityCheckbox.checked = true;

                        const cityLabel = document.createElement("label");
                        cityLabel.setAttribute("for", city);
                        cityLabel.innerText = city;
                        cityDiv.append(cityCheckbox);
                        cityDiv.append(cityLabel);
                    });
                    showServices(services);
                }

                bsCollapse.show();
                searchBtn.removeEventListener("click", search);

            });
    }
}


function showServices(services) {

    const coachWrapper = document.getElementById("service-wrapper");

    services.map(service => {

        const col = document.createElement("div");
        col.classList.add("col-sm-3", "d-flex");
        col.id = service["service_id"];
        coachWrapper.append(col);


        const serviceCard = document.createElement("div");
        serviceCard.classList.add("card", "mb-2");
        serviceCard.style.width = "18rem";
        col.append(serviceCard);

        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");
        serviceCard.append(cardBody);

        const title = document.createElement("h4");
        title.classList.add("card-title");
        title.innerText = service["title"];
        cardBody.append(title);

        const city = document.createElement("h6");
        city.classList.add("card-subtitle", "mb-2", "text-muted");
        city.innerText = service["city_name"];
        cardBody.append(city);

        const description = document.createElement("p");
        description.classList.add("card-text");
        description.innerText = service["description"];
        cardBody.append(description);

        const cardFooter = document.createElement("div");
        cardFooter.classList.add("card-footer", "d-flex", "justify-content-center");
        serviceCard.append(cardFooter);

        const lookBtn = document.createElement("h3");
        cardFooter.append(lookBtn);
        const btnIcon = document.createElement("i");
        btnIcon.classList.add("bi", "bi-eyeglasses")
        btnIcon.setAttribute("type", "button");
        btnIcon.addEventListener("click", () => {
            getServiceById(service["service_id"]);
        })
        lookBtn.append(btnIcon);

    });

}

function removeService(services) {

    const coachWrapper = document.getElementById("service-wrapper");

    services.forEach(service => {
        coachWrapper.removeChild(document.getElementById(service["service_id"]));
    });
};


function getServiceById(serviceId) {

    fetch(`/services/${serviceId}`)
        .then(response => response.json())
        .then(({ services }) => {

            const avaiableSessionsBtn = document.getElementById("avaiableSessionsBtn");

            services.map(service => {

                if (!service["first_name"]) {
                    document.getElementById("coachNameCompanyname").innerText =
                        `${service["company_name"]} cvr: ${service["cvr_number"]}`
                } else if (!service["company_name"]) {
                    document.getElementById("coachNameCompanyname").innerText =
                        `${service["first_name"]} ${service["last_name"]}`;
                }

                document.getElementById("phone").innerText = `Tlf: ${service["phone_number"]}`;
                document.getElementById("email").innerText = `Email: ${service["email"]}`;
                document.getElementById("price").innerText = `Pris: ${service["price"]} DKK`;
                document.getElementById("address").innerText = `Addresse: ${service["street_name"]} ${service["number"]} ${service["postal_code"]} ${service["city_name"]}`;
                document.getElementById("cancellationNotice").innerText = `Afbestillingsvarsel: ${service["cancellation_notice"]} Timer`;
                document.getElementById("cancellationFee").innerText = `Afbestillingsgebyr: ${service["cancellation_fee"]} DKK`;


                avaiableSessionsBtn.addEventListener("click", getAvaibleTrainingSessions, false);
                avaiableSessionsBtn.serviceId = service["service_id"];
            });

        });

    readMoreModal.show();
}


function getAvaibleTrainingSessions(e) {

    document.getElementById("avaiableSessions-wrapper").innerText = "";


    readMoreModal.hide();
    avaiableSessions.show();

    fetch(`/training_session/?service=${e.currentTarget.serviceId}`)
        .then(response => response.json())
        .then(({ sessions }) => {

            const avaiableSessionsWrapper = document.getElementById("avaiableSessions-wrapper");

            if (Object.entries(sessions).length !== 0) {

                sessions.map(session => {

                    const li = document.createElement("li");
                    li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");

                    var sessionDate = new Date(session["date"]);

                    year = sessionDate.getFullYear();
                    month = (sessionDate.getMonth() + 1).toString().padStart(2, "0");
                    day = sessionDate.getDate().toString().padStart(2, "0");

                    li.innerText = `Dato: ${day}-${month}-${year} Tidspunkt: ${session["start"]}-${session["end"]}`;
                    const bookBtn = document.createElement("button");
                    bookBtn.classList.add("btn", "btnMain");
                    bookBtn.innerText = "Book denne tid";
                    bookBtn.addEventListener("click", () => {
                        const confirmBox = confirm("Du er at booke denne tid. Bekræft venligst.");

                        if (confirmBox) {
                            addBooking(session["session_id"], session["date"], session["start"], session["end"]);
                        }
                    })
                    li.append(bookBtn);
                    avaiableSessionsWrapper.append(li);

                })
            } else {
                const li = document.createElement("li");
                li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
                li.innerText = "Der er desværre ingen ledige tider."
                avaiableSessionsWrapper.append(li);
            }
        });
}

function addBooking(sessionId, date, start, end) {

    fetch("/athletes/bookings", {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({
            booking_date: date,
            booking_start: start,
            booking_end: end,
            session_id: sessionId
        })
    }).then(response => {

        switch (response.status) {

            case 200:
                toastr.success("Din træner skal godkend din anmodning, før du kan se din booking.");
                setTimeout(() => avaiableSessions.hide, 3000);
                break;

            case 401:
                toastr.warning("Du skal logge ind, før du kan lave en booking.");
                setTimeout(() => location.href = "/login", 3000);
                break;

            case 403:
                toastr.warning("Du skal logge ind, før du kan lave en booking.");
                setTimeout(() => location.href = "/login", 3000);
                break;

            case 500:
                toastr.error("Denne tid afventer bekræftelse.");
                break;


        }

    })

}


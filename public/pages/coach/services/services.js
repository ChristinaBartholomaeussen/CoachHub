
fetch("/api/sports")
    .then(response => response.json())
    .then(({ sports }) => {

        const sportsList = document.getElementById("selectSport");

        sports.map(sport => {

            const sportItem = document.createElement("option");
            sportItem.value = sport["sport_id"];
            sportItem.innerHTML = `${escapeHTML(sport["name"])}`;

            sportsList.appendChild(sportItem);
        });

    });


document.getElementById("save").addEventListener("click", () => {

    if (validateForm()) {
        saveService();
    }
});

function validateForm() {

    if (document.getElementById("title").value === '' || document.getElementById("selectSport").value === ''
        || document.getElementById("price").value === '' ||
        document.getElementById("description").value === '') {

        toastr.warning("Udfyld venligst som minimun (Overskrift, Spotsgren, Varighed, Pris og Beskrivelse");
        return false;
    }
    return true;
}


function saveService() {

    fetch("/coachs/services", {
        method: "POST",
        headers: { "Content-type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
            title: document.getElementById("title").value,
            sport_id: document.getElementById("selectSport").value,
            price: document.getElementById("price").value,
            cancellation_notice: document.getElementById("cancellationNotice").value,
            cancellation_fee: document.getElementById("cancellationFee").value,
            description: document.getElementById("description").value
        })
    }).then(response => {

        const form = document.getElementById("serviceForm");
        switch (response.status) {

            case 201:
                toastr.success("Din træning er blevet gemt.");
                setTimeout(() => form.reset(), 3000);
                break;

            case 500:
                toastr.error("Der skete en fejl. Prøv igen senere.");
                break;
        }
    });
};


fetch("/coachs/services")
    .then(response => response.json())
    .then(({ services }) => {

        const serviceWrapper = document.getElementById("service-wrapper");

        services.map(service => {

            const col = document.createElement("div");
            col.id = service["service_id"];
            col.classList.add("col-sm-3", "d-flex");
            col.id = service["service_id"];
            serviceWrapper.append(col);

            const cardDiv = document.createElement("div");
            cardDiv.classList.add("card");
            cardDiv.style.width = "18rem";
            cardDiv.style.margin = "10px";
            col.append(cardDiv);

            const cardHeader = document.createElement("div");
            cardHeader.classList.add("card-header");
            cardHeader.innerText = "Træning";
            cardDiv.append(cardHeader);

            const cardBody = document.createElement("div");
            cardBody.classList.add("card-body");
            cardDiv.append(cardBody);

            const title = document.createElement("h5");
            title.classList.add("card-title");
            title.innerHTML = `${escapeHTML(service["title"])}`
            cardBody.append(title);

            const cardUl = document.createElement("ul");
            cardUl.classList.add("list-group");
            cardUl.classList.add("list-group-flush");
            cardDiv.append(cardUl);

            const sport = document.createElement("li");
            sport.classList.add("list-group-item");
            sport.innerHTML = `<strong>Sportsgren:</strong> ${escapeHTML(service["name"])}`;
            cardUl.append(sport);

            const price = document.createElement("li");
            price.classList.add("list-group-item");
            price.innerHTML = `<strong>Pris DKK:</strong> ${service["price"]}`;
            cardUl.append(price);

            const cancelTime = document.createElement("li");
            cancelTime.classList.add("list-group-item");

            const cancelNoticeArr = service["cancellation_notice"].split(':');
            let cancelHour = formatHour(cancelNoticeArr[0]);
            let cancelMin = formatMin(cancelNoticeArr[1]);
            cancelTime.innerHTML = `<strong>Afbestillingsvarsel: </strong> ${escapeHTML(cancelHour)} Timer ${escapeHTML(cancelMin)} Minutter`;
            cardUl.append(cancelTime);

            const cancelFee = document.createElement("li");
            cancelFee.classList.add("list-group-item");
            cancelFee.innerHTML = `<strong>Afbestillingsgebyr DKK:</strong> ${service["cancellation_fee"]}`;
            cardUl.append(cancelFee);

            const cardBody2 = document.createElement("div");
            cardBody2.classList.add("card-body");
            cardDiv.appendChild(cardBody2);

            const desciption = document.createElement("p");
            desciption.classList.add("card-text");
            desciption.innerHTML = `<strong>Beskrivelse: </strong> <br>
            ${escapeHTML(service["description"])}`;
            cardBody2.append(desciption);

            const buttonDiv = document.createElement("div");
            buttonDiv.classList.add("card-footer", "d-flex", "justify-content-center");
            cardDiv.append(buttonDiv);

            const h2 = document.createElement("h2");
            const deleteBtn = document.createElement("i");
            deleteBtn.classList.add("bi");
            deleteBtn.classList.add("bi-trash-fill");
            deleteBtn.setAttribute("type", "button");
            deleteBtn.addEventListener("click", () => {
                const confirmDelete = confirm("Du er ved at slette en træning.");
                if (confirmDelete) {

                    deleteService(service["service_id"], col);
                    
                }
            });
            h2.append(deleteBtn);
            buttonDiv.append(h2);
        });
    });


function formatHour(hourToFormat) {

    let formatted;

    if (hourToFormat.charAt(0) === '0') {
        formatted = hourToFormat.replace("0", "");

    } else {
        return hourToFormat;
    }

    return formatted;
}

function formatMin(minToFormat) {

    let formatted;

    if (minToFormat.charAt(0) === '0') {
        formatted = minToFormat.replace("0", "");

    } else {
        return minToFormat;
    }

    return formatted;
}

function deleteService(serviceId, cardDiv) {

    fetch(`/coachs/services/${serviceId}`, {
        method: "DELETE",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then(response => {

        const serviceWrapper = document.getElementById("service-wrapper");

        switch (response.status) {

            case 200:
                toastr.success("Fuldført");
                serviceWrapper.removeChild(cardDiv);
                break;

            case 500:
                toastr.error("Der skete en fejl. Prøv igen senere.");
                break;
        }
    });
};
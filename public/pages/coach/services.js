
fetch("/api/sports")
    .then(response => response.json())
    .then(({ sports }) => {

        const sportsList = document.getElementById("selectSport");

        sports.map(sport => {

            const sportItem = document.createElement("option");
            sportItem.value = sport["sport_id"];
            sportItem.innerHTML = sport["name"];

            sportsList.appendChild(sportItem);
        });

    });


document.getElementById("save").addEventListener("click", () => {

    if (validateForm()) {
        saveService();
    }
});

function validateForm() {

    if (document.getElementById("title").value === '' || document.getElementById("selectSport").value === '' ||
        document.getElementById("duration").value === '' || document.getElementById("price").value === '' ||
        document.getElementById("description").value === '') {

        toastr.warning("Udfyld venligst som minimun (Overskrift, Spotsgren, Varighed, Pris og Beskrivelse");
        return false;

    }

    return true;

}


function saveService() {

    fetch("/coachs/services", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({
            title: document.getElementById("title").value,
            sport_id: document.getElementById("selectSport").value,
            duration: document.getElementById("duration").value,
            preperation_time: document.getElementById("preperationTime").value,
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
        }
    })
}


fetch("/coachs/api/services")
    .then(response => response.json())
    .then(({ services }) => {

        const serviceWrapper = document.getElementById("service-wrapper");

        services.map(service => {

            const cardDiv = document.createElement("div");
            cardDiv.id = service["service_id"];
            cardDiv.classList.add("card");
            cardDiv.style.width = "18rem";
            cardDiv.style.margin = "10px";
            serviceWrapper.append(cardDiv);

            const cardHeader = document.createElement("div");
            cardHeader.classList.add("card-header");
            cardHeader.innerHTML = "Træning";
            cardDiv.append(cardHeader);

            const cardBody = document.createElement("div");
            cardBody.classList.add("card-body");
            cardDiv.append(cardBody);

            const title = document.createElement("h5");
            title.classList.add("card-title");
            title.innerHTML = `${service["title"]}`
            cardBody.append(title);

            const cardUl = document.createElement("ul");
            cardUl.classList.add("list-group");
            cardUl.classList.add("list-group-flush");
            cardDiv.append(cardUl);

            const sport = document.createElement("li");
            sport.classList.add("list-group-item");
            sport.innerHTML = `<strong>Sportsgren:</strong> ${service["name"]}`;
            cardUl.append(sport);


            const duration = document.createElement("li");
            duration.classList.add("list-group-item");

            const durationArr = service["duration"].split(':');
            let durationHour = formatHour(durationArr[0]);
            let durationMin = formatMin(durationArr[1]);
            duration.innerHTML = `<strong>Varighed:</strong> ${durationHour} Timer ${durationMin} Minutter`;
            cardUl.append(duration);


            const prepTime = document.createElement("li");
            prepTime.classList.add("list-group-item");
            const prepArr = service["preperation_time"].split(':');
            let prepHour = formatHour(prepArr[0]);
            let prepMin = formatMin(prepArr[1]);
            prepTime.innerHTML = `<strong>Forbedredelsestid:</strong> ${prepHour} Timer ${prepMin} Minutter`;
            cardUl.append(prepTime);

            const price = document.createElement("li");
            price.classList.add("list-group-item");
            price.innerHTML = `<strong>Pris DKK:</strong> ${service["price"]}`;
            cardUl.append(price);


            const cancelTime = document.createElement("li");
            cancelTime.classList.add("list-group-item");

            const cancelNoticeArr = service["cancellation_notice"].split(':');
            let cancelHour = formatHour(cancelNoticeArr[0]);
            let cancelMin = formatMin(cancelNoticeArr[1]);
            cancelTime.innerHTML = `<strong>Afbestillingsvarsel: </strong> ${cancelHour} Timer ${cancelMin} Minutter`;
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
            ${service["description"]}`;
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
                    deleteService(service["service_id"], cardDiv);

                }
            });
            h2.append(deleteBtn);
            buttonDiv.append(h2);
        });
    });


/**
 * Funktion, der formatterer timer
 * @param {} hourToFormat 
 * @returns 
 */

function formatHour(hourToFormat) {

    let formatted;

    if (hourToFormat.charAt(0) === '0') {
        formatted = hourToFormat.replace("0", "");

    } else {
        return hourToFormat;
    }

    return formatted;
}

/**
 * Funktion, der formattere minutter
 * @param {} minToFormat 
 * @returns 
 */
function formatMin(minToFormat) {

    let formatted;

    if (minToFormat.charAt(0) === '0') {
        formatted = minToFormat.replace("0", "");

    } else {
        return minToFormat;
    }

    return formatted;
}
/**
 * Funktion, der fetcher DELETE request med det specfikke ID
 * @param {*} serviceId 
 */
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
}
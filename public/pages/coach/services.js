

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
})

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
            sport.innerHTML = `${service["name"]}`;
            cardUl.append(sport);


            const duration = document.createElement("li");
            duration.classList.add("list-group-item");

            const durationArr = service["duration"].split(':');
            let durationHour = formatHour(durationArr[0]);
            let durationMin = formatMin(durationArr[1]);
            duration.innerHTML = `Varighed: ${durationHour} Timer ${durationMin} Minutter`;
            cardUl.append(duration);


            const prepTime = document.createElement("li");
            prepTime.classList.add("list-group-item");
            const prepArr = service["preperation_time"].split(':');
            let prepHour = formatHour(prepArr[0]);
            let prepMin = formatMin(prepArr[1]);
            prepTime.innerHTML = `Forbedredelsestid: ${prepHour} Timer ${prepMin} Minutter`;
            cardUl.append(prepTime);

            const price = document.createElement("li");
            price.classList.add("list-group-item");
            price.innerHTML = `Pris DKK: ${service["price"]}`;
            cardUl.append(price);


            const cancelTime = document.createElement("li");
            cancelTime.classList.add("list-group-item");

            const cancelNoticeArr = service["cancellation_notice"].split(':');
            let cancelHour = formatHour(cancelNoticeArr[0]);
            let cancelMin = formatMin(cancelNoticeArr[1]);
            cancelTime.innerHTML = `Afbestillingsvarsel: ${cancelHour} Timer ${cancelMin} Minutter`;
            cardUl.append(cancelTime);


            const cancelFee = document.createElement("li");
            cancelFee.classList.add("list-group-item");
            cancelFee.innerHTML = `Afbestillingsgebyr DKK: ${service["cancellation_fee"]}`;
            cardUl.append(cancelFee);


            const cardBody2 = document.createElement("div");
            cardBody2.classList.add("card-body");
            cardDiv.appendChild(cardBody2);

            const desciption = document.createElement("p");
            desciption.classList.add("card-text");
            desciption.innerHTML = `${service["description"]}`;
            cardBody2.append(desciption);

            const buttonDiv = document.createElement("div");
            buttonDiv.classList.add("card-footer");
            buttonDiv.classList.add("d-flex");
            buttonDiv.classList.add("justify-content-center");
            cardDiv.append(buttonDiv);

            const deleteBtn = document.createElement("button");
            deleteBtn.classList.add("btn");
            deleteBtn.classList.add("btn-danger");
            deleteBtn.innerHTML = "Slet";
            buttonDiv.append(deleteBtn);
            buttonDiv.onclick = () => {
                serviceWrapper.removeChild(cardDiv); //Den fjerner den specfikke div, inden siden bliver loadet igen
            };

        })
    })




function formatHour(hourToFormat) {

    let formatted;

    if(hourToFormat.charAt(0) === '0') {
        formatted = hourToFormat.replace("0", "");

    } else {
        return hourToFormat;
    }

    return formatted;
}


function formatMin(minToFormat) {

    let formatted;

    if(minToFormat.charAt(0) === '0') {
        formatted = minToFormat.replace("0", "");

    } else {
        return minToFormat;
    }

    return formatted;
}
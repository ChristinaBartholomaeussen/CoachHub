
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
        console.log("intet fundet");
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
        //serviceCard.id = service["service_id"];
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
        lookBtn.append(btnIcon);

    });

}


function removeService(services) {

    const coachWrapper = document.getElementById("service-wrapper");

    services.forEach(service => {
        coachWrapper.removeChild(document.getElementById(service["service_id"]));
    });
}

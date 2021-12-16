const sportsDiv = document.getElementById("sports-wrapper");

fetch("/admin/profiles?status=0&role=2")
    .then(response => response.json())
    .then(({ coachs }) => {

        document.getElementById("profilesToAccept").innerHTML = `
    <a class="btn btnMain" href="/admin/accept-profiles"><h3> ${coachs.length}</h3></a>`;

    });

fetch("/api/sports")
    .then(response => response.json())
    .then(({ sports }) => {

        sports.map(sport => {

            const sportsLi = document.createElement("li");
            sportsLi.classList.add("list-group-item");
            sportsLi.innerHTML = `${escapeHTML(sport["name"])}`

            sportsDiv.appendChild(sportsLi);
        });

    });

document.getElementById("saveSport").addEventListener("click", saveSport);

function saveSport() {

    if (document.getElementById("sportName").value === '') {

        toastr.error("Feltet må ikke være tomt");

    } else {
        fetch("/api/sports", ({
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                name: document.getElementById("sportName").value
            })
        })).then(response => {

            switch (response.status) {
                case 201:
                    response.json()
                        .then(({ sport }) => {

                            const sportsLi = document.createElement("li");
                            sportsLi.classList.add("list-group-item");
                            sportsLi.innerHTML = `${escapeHTML(sport[0]["name"])}`

                            sportsDiv.appendChild(sportsLi);

                        });

                    document.getElementById("sportName").value = '';
                    toastr.success("Den nye sportsgren er oprettet.");
                    break;

                case 400:
                    toastr.error("Sportgrenen eksisterer allerede");
                    document.getElementById("sportName").value = '';

                    break;
            }
        })
    }
};


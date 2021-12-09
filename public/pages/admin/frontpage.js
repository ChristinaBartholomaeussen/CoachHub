
fetch("/admin/profiles/api?status=0&role=2")
.then(response => response.json())
.then(({coachs}) => {
    
    document.getElementById("profilesToAccept").innerHTML = `
    <a class="btn btnMain" href="/admin/profiles"><h3>${coachs.length}</h3></a>
    ` ; 
});




//Denne funktionalitet er afgrænset fra
/*fetch("/services")
.then(response => response.json())
.then(({total}) => {
    document.getElementById("servicesToAccept").innerHTML = `
    <h3>0</h3>
    ` ;
})*/







const sportsDiv = document.getElementById("sports-wrapper");

fetch("/api/sports")
    .then(response => response.json())
    .then(({ sports }) => {


        sports.map(sport => {

            const sportsLi = document.createElement("li");
            sportsLi.classList.add("list-group-item");
            sportsLi.innerHTML = `${sport["name"]}`

            sportsDiv.appendChild(sportsLi);
        });

    });

document.getElementById("saveSport").addEventListener("click", saveSport);

function saveSport() {

    if (document.getElementById("sportName").value === '') {
        const error = toastr.warning({
            timeOut: 0
        });
        error.find(".toast-message").text("Feltet må ikke være tomt");
    }

    else {

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
                    response.json().then(({ sport }) => {

                        const sportsLi = document.createElement("li");
                        sportsLi.classList.add("list-group-item");
                        sportsLi.innerHTML = `${sport[0]["name"]}`

                        sportsDiv.appendChild(sportsLi);

                    });

                    document.getElementById("sportName").value = '';
                    

                    const succes = toastr.success({
                        timeOut: 0                       
                    });

                    succes.find(".toast-message").text("Den nye sportsgren er oprettet");
                    
                    
                    break;

                case 400:
                    const error = toastr.error({
                        timeOut: 0
                    });

                    document.getElementById("sportName").value = '';
                    error.find(".toast-message").text("Sportgrenen eksisterer allerede");
                    
                    break;

            }
        })
    }
}


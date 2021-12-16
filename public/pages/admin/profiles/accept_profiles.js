fetch("/admin/profiles?status=0&role=2")
    .then(response => response.json())
    .then(({ coachs }) => {

        const coachWrapper = document.getElementById("coach-wrapper");

        let divId = 0;

        coachs.map(coach => {

            const coachDiv = document.createElement("div");
            coachDiv.id = divId += 1;
            coachDiv.classList.add("card", "profile-div");

            const profilePicture = document.createElement("img");
            profilePicture.classList.add("card-img-top");
            profilePicture.style.marginTop = "10px";
            profilePicture.src = "../../assets/default_profilepictue.jpg";

            coachDiv.append(profilePicture);

            const cardTitle = document.createElement("div");
            cardTitle.classList.add("card-body");
            cardTitle.style.flex = 0;
            coachDiv.append(cardTitle);

            const companyPrivate = document.createElement("h5");
            companyPrivate.classList.add("card-title");

            const companyPrivateName = document.createElement("p");
            companyPrivateName.classList.add("card-text");

            cardTitle.append(companyPrivate);
            cardTitle.append(companyPrivateName);

            const list = document.createElement("ul");
            list.classList.add("list-group");
            list.classList.add("list-group-flush");
            coachDiv.append(list);

            if (coach["coach_type"] === 'Commercial') {

                companyPrivate.innerText = "Virksomhed";
                companyPrivateName.innerHTML = `${escapeHTML(coach["company_name"])}`

                const cvr = document.createElement("li");
                cvr.classList.add("list-group-item");
                list.append(cvr);

                cvr.innerHTML = `<b>CVR:</b>  ${escapeHTML(coach["cvr_number"])}`;


            } else {
                companyPrivate.innerText = "Privat";
                companyPrivateName.innerHTML = `${escapeHTML(coach["first_name"])} ${escapeHTML(coach["last_name"])}`;
            }

            const email = document.createElement("li");
            email.classList.add("list-group-item");
            list.append(email);
            email.innerHTML = `<b>Email: </b> ${escapeHTML(coach["email"])}`

            const phone = document.createElement("li");
            phone.classList.add("list-group-item");
            list.append(phone);
            phone.innerHTML = `<b>Telefon: </b> ${escapeHTML(coach["phone_number"])}`

            const address = document.createElement("li");
            address.classList.add("list-group-item");
            list.append(address);
            address.innerHTML = `<b>Addresse: </b><br> 
            ${escapeHTML(coach["street_name"])} ${escapeHTML(coach["number"])} <br>
            ${escapeHTML(coach["postal_code"])} ${escapeHTML(coach["city_name"])}`

            const acceptDecline = document.createElement("div");
            acceptDecline.classList.add("card-body", "accept-decline-btn-wrapper");
            coachDiv.append(acceptDecline);

            const acceptBtn = document.createElement("button");
            acceptBtn.classList.add("btn", "btn-success");
            acceptBtn.innerText = "Godkend";
            acceptDecline.append(acceptBtn);
            acceptBtn.onclick = async function () {
                acceptProfile(coach["user_id"], coachDiv, coachWrapper);
            }


            const declineBtn = document.createElement("button");
            declineBtn.classList.add("btn", "btn-danger");
            declineBtn.style.marginLeft = "82px";
            declineBtn.innerText = "Afvis";
            acceptDecline.append(declineBtn);
            declineBtn.onclick = () => {
                coachWrapper.removeChild(coachDiv); //Den fjerner den specfikke div, inden siden bliver loadet igen
            };

            coachWrapper.append(coachDiv);
        });
    });

function acceptProfile(userId, coachDiv, parentDiv) {

    fetch(`/admin/profiles/${userId}`, {
        method: "PATCH",
        headers: {
            "Content-type": "application/json"
        }
    })
        .then(response => {

            switch (response.status) {

                case 200:
                    toastr.success("En mail er sendt til brugeren.")
                    parentDiv.removeChild(coachDiv);
                    break;
                case 500:
                    toastr.error("Der skete en fejl. Prøv igen senere.");
                    console.log(response.statusText);
                    break;
            }
        });
}
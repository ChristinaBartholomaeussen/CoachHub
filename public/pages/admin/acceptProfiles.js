
const coachWrapper = document.getElementById("coach-wrapper");
fetch("/admin/profiles/api?status=0&role=2")
    .then(response => response.json())
    .then(({ coachs }) => {

        
        let divId = 0;

        coachs.map(coach => {

            const coachDiv = document.createElement("div");
            coachDiv.id = divId+=1;
            coachDiv.classList.add("card");
            coachDiv.style.width = "18rem";
            coachDiv.style.margin = "10px";
            coachDiv.style.height = "641px";

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

                companyPrivate.innerHTML = `Virksomhed`;
                companyPrivateName.innerHTML = `${coach["company_name"]}`

                const cvr = document.createElement("li");
                cvr.classList.add("list-group-item");
                list.append(cvr);

                cvr.innerHTML = `<b>CVR:</b>  ${coach["cvr_number"]}`;


            } else {
                companyPrivate.innerHTML = `Privat`;
                companyPrivateName.innerHTML = `${coach["first_name"]} ${coach["last_name"]}`;
            }

            const email = document.createElement("li");
            email.classList.add("list-group-item");
            list.append(email);
            email.innerHTML = `<b>Email: </b> ${coach["email"]}`

            const phone = document.createElement("li");
            phone.classList.add("list-group-item");
            list.append(phone);
            phone.innerHTML = `<b>Email: </b> ${coach["phone_number"]}`

            const address = document.createElement("li");
            address.classList.add("list-group-item");
            list.append(address);
            address.innerHTML = `<b>Addresse: </b><br> 
            ${coach["street_name"]} ${coach["number"]} <br>
            ${coach["postal_code"]} ${coach["city_name"]}`

            const acceptDecline= document.createElement("div");
            acceptDecline.classList.add("card-body");
            acceptDecline.style.flex = 0;
            acceptDecline.style.position = "absolute";
            acceptDecline.style.bottom = 0;
            coachDiv.append(acceptDecline);


            const acceptBtn = document.createElement("button");
            acceptBtn.classList.add("btn");
            acceptBtn.classList.add("btn-success");
            acceptBtn.innerHTML = "Godkend";
            acceptDecline.append(acceptBtn);
            acceptBtn.onclick = async function () {
                acceptProfile(coach["user_id"], coachDiv);
            }



            const declineBtn = document.createElement("button");
            declineBtn.classList.add("btn");
            declineBtn.classList.add("btn-danger");
            declineBtn.style.marginLeft = "82px";
            declineBtn.innerHTML = "Afvis";
            acceptDecline.append(declineBtn);
            declineBtn.onclick = () => {
                coachWrapper.removeChild(coachDiv); //Den fjerner den specfikke div, inden siden bliver loadet igen
            };

            coachWrapper.append(coachDiv);
        });
    });




    function acceptProfile(userId, coachDiv) {

        fetch(`/admin/profiles/api/${userId}`, {
            method: "PATCH", 
            headers: {
                "Content-type": "application/json"
            }
        })
        .then(response => {
            if(response.status === 200) {
                
                const success = toastr.success({
                    timeOut: 0
                });

                success.find("a.toast-message").text("En mail er sendt til brugeren.");

                coachWrapper.removeChild(coachDiv);
            }
        });
    }
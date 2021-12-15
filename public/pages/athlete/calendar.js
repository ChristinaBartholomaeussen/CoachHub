fetch("/athletes/bookings")
    .then(response => response.json())
    .then(({ bookings }) => {

        const acceptedBookingsWrapper = document.getElementById("accepted-bookings-wrapper");
        const pendingBookingsWrapper = document.getElementById("pending-bookings-wrapper");
        const endedBookingsWrapper = document.getElementById("ended-bookings-wrapper");

        const upCommingBookings =  bookings.filter(booking => new Date(booking["booking_date"]) > Date.now())
        .sort((bookingA, bookingB) =>  new Date(bookingA["booking_date"]) - new Date(bookingB["booking_date"]));

        bookings.map(booking => {

            const li = document.createElement("li");
            li.classList.add("list-group-item");

            var bookingDate = new Date(booking["booking_date"]);

            const year = bookingDate.getFullYear();
            const month = (bookingDate.getMonth() + 1).toString().padStart(2, "0");
            const day = bookingDate.getDate().toString().padStart(2, "0");

            const start = booking["booking_start"].substring(0, 5);
            const end = booking["booking_end"].substring(0, 5);

            li.innerHTML = `<b>Dato:</b> ${day}-${month}-${year} <br>  
            <b>Tidsrum</b> ${start}-${end} <br>
            <b>Service:</b> ${booking["title"]}`;

            if (booking["isConfirmed"] === 1 && upCommingBookings.includes(booking)) {
                acceptedBookingsWrapper.append(li);
            } else if (booking["isConfirmed"] === 0 && upCommingBookings.includes(booking)) {
                pendingBookingsWrapper.append(li);
            } else {
                endedBookingsWrapper.append(li);
            }
        });



    })
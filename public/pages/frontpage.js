

const searchBox = document.getElementById('collapseExample')

searchBox.addEventListener('show.bs.collapse', function () {
  
    console.log(document.getElementById("searchSport").value);

    if(document.getElementById("searchSport").value === '') {

        document.getElementById("header").innerHTML = "Intet fundet - skriv noget i søgefeltet";

    }

});



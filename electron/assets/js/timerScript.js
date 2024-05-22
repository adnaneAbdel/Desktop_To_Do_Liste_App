const {ipcRenderer} = require('electron')

let form = document.querySelector("form");


form.addEventListener("submit", function(e) {
    e.preventDefault();
    let note = document.querySelector(".note").value;
    let pickedHoures = document.querySelector(".pick-hours").value * 3600000;
    let pickedMinute = document.querySelector(".pick-minute").value * 60000;
    let notificationDate = Date.now();

    notificationDate += (pickedHoures + pickedMinute);
    notificationDate = new Date(notificationDate)
    ipcRenderer.send("add-timed-note", note , notificationDate);
})
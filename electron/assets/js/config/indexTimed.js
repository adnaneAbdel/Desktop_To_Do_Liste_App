const { ipcRenderer } = require('electron')
let newTimed = document.querySelector('.todo-timed .add-new-task');
const connection = require("./connection")
ipcRenderer.on("add-timed-note", function (e, note, notificationTime) {
    addTimedTask(note, notificationTime);
});

function addTimedTask(note, notificationTime) {
    connection.insert({
        into: "timed",
        values: [{
            note: note,
            pick_status: 0,
            pick_time: notificationTime
        }]
    }).then(() => showTimed());
}
newTimed.addEventListener('click', function () {
    ipcRenderer.send('open-timed-note');
});
async function deleteTimedTask(taskId) {
    return connection.remove({
        from: "timed",
        where:{
            id: taskId
        }
    }).then(() => showTimed());
}
async function updateTask(taskId, taskValue){
    await connection.update({
        in: "tasks",
        where: {
            id: taskId
        },
        set: {
            note: taskValue
        }
    });
    return showTimed();

}
function showTimed() {
    let timedList = document.querySelector(".todo-timed-list");
    let clearTimedBtn = document.querySelector(".todo-timed .clear-all");
    timedList.innerHTML = "";
    connection.select({
        from: "timed"
    }).then((tasks) => {
        clearTimedBtn.addEventListener("click", function(){
            return connection.remove({
                from: "timed"
            }).then(() => showTimed());
        })
        if (tasks.length === 0) {
            timedList.innerHTML = "<li class= 'empty-list'>No Task Exit </li>"
        } else {
            for (let task of tasks) {
                let listItem = document.createElement("li");
                let taskInput = document.createElement("input");
                let buttonsHolder = document.createElement("div");
                let updateBTN = document.createElement("button");
                let exportBTN = document.createElement("button");
                let timeHolder = document.createElement('div');
                let deleteBTN = document.createElement("button");
                
                timeHolder.classList.add("time-holder");
                buttonsHolder.classList.add("buttons-holder");
                deleteBTN.innerHTML = "Delete";
                updateBTN.innerHTML = "Edit";
                exportBTN.innerHTML = "Export";
                listItem.classList.add("li")
                deleteBTN.classList.add("deletebtn")
                updateBTN.classList.add("editbtn")
                exportBTN.classList.add("importbtn")


                deleteBTN.addEventListener("click",function(){
                    deleteTimedTask(task.id)
                })
                updateBTN.addEventListener("click", () => {
                    updateTask(task.id, taskInput.value)
                })
                exportBTN.addEventListener("click", () => {
                    ipcRenderer.send("create-txt", task.note);
                })

                // if(task.pick_status === 1){
                //     timeHolder.innerHTML = "I Will Remember you At" + task.pick_time.toLocalTimeString();
                // }else{
                //     timeHolder.innerHTML = "The Remember is Done" + task.pick_time.toLocalTimeString();
                // }


                let checkInterval = setInterval(function(){
                    let currentDate = new Date();

                    if(task.pick_time.toString() === currentDate.toString()){
                        connection.update({
                            in: "timed",
                            where:{
                                id: task.id
                            },
                            set:{
                                pick_status:1
                            }
                        }).then(() => showTimed())

                        ipcRenderer.send("notify", task.note);

                        clearInterval(checkInterval);
                    }
                }, 1000);
                buttonsHolder.appendChild(deleteBTN);
                buttonsHolder.appendChild(updateBTN);
                buttonsHolder.appendChild(exportBTN);
               
                taskInput.value = task.note;
                listItem.appendChild(taskInput);
                timedList.appendChild(listItem)
                listItem.appendChild(buttonsHolder)
            }
        }
    })
}
showTimed()
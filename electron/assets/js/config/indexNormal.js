const { ipcRenderer } = require("electron")
const connection = require("./connection")
let newNormal  = document.querySelector(".todo-normal .add-new-task");
newNormal.addEventListener("click", function(){
    ipcRenderer.send("new-normal");
})
ipcRenderer.on("add-noraml-task", function(e, task){
    addNoramlTask(task);
});

function addNoramlTask(task){
    connection.insert({
        into: "tasks",
        values: [{
            note: task
        }]
    }).then(() => showNormal());
}

async function deleteTask(taskId){
    await connection.remove({
        from: "tasks",
        where: {
            id: taskId
        }
    });
    return showNormal();

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
    return showNormal();

}
function showNormal(){
    let normalTasksList = document.querySelector(".todo-normal-list");
    normalTasksList.innerHTML = "";

    connection.select({
        from: "tasks"
    }).then((tasks) => {
        let clearNormalBtn = document.querySelector(".todo-normal .clear-all");
        if(tasks.length === 0 ){
            normalTasksList.innerHTML = `<li class='empty-list'> No Task Excit </li>`
        }else{
            clearNormalBtn.addEventListener("click", function(){
                return connection.remove({
                    from: "tasks"
                }).then(() => showNormal())
            })
            for(let task of tasks){
                let listItem = document.createElement("li")
                listItem.classList.add("li")
                let taskInput = document.createElement("input");
                let deleteBTN = document.createElement('button');
                let buttonsHolder = document.createElement("div");
                let updateBTN = document.createElement("button");
                let exportBTN = document.createElement("button");
                deleteBTN.classList.add("deletebtn")
                updateBTN.classList.add("editbtn")
                exportBTN.classList.add("importbtn")
                buttonsHolder.classList.add("buttons-holder");
                 deleteBTN.innerHTML = "Delete";
                 updateBTN.innerHTML = "Edit";
                 exportBTN.innerHTML = "Export";
                deleteBTN.addEventListener("click", () => {
                    deleteTask(task.id)
                })
                updateBTN.addEventListener("click", () => {
                    updateTask(task.id, taskInput.value)
                })
                exportBTN.addEventListener("click", () => {
                    ipcRenderer.send("create-txt", task.note);
                })
                taskInput.value = task.note ;
                buttonsHolder.appendChild(deleteBTN);
                buttonsHolder.appendChild(updateBTN);
                buttonsHolder.appendChild(exportBTN);
                listItem.appendChild(taskInput)
                listItem.appendChild(buttonsHolder)
                normalTasksList.appendChild(listItem);

            }
        }
    })
}

showNormal();
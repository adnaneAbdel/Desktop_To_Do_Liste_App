const { ipcRenderer } = require("electron")
const connection = require("./connection");
const fs = require("fs")
let newImaged = document.querySelector(".todo--images .add-new-task");

newImaged.addEventListener("click", function(){
    ipcRenderer.send("new-imaged");
})


ipcRenderer.on("add-imaged-task", function(e,note, imgURI){
    addImagedTask(note, imgURI)
});


function addImagedTask(note, imgURI){
    connection.insert({
        into: "imaged",
        values: [{
            note: note, 
            img_url : imgURI
        }]
    }).then(() => showImaged());
}
   

function deleteImagedTask(taskId , imgURI){
    if(imgURI){
        fs.unlink(imgURI, (err) => {
            console.log(err)
            return;
        })
    }
    return connection.remove({
        from: "imaged",
        where:{
            id: taskId
        }
    }).then(() => showImaged());
}

function updateImagedTask(taskId, taskValue){
    connection.update({
        in:"imaged",
        where:{
            id: taskId
        },
        set:{
            note:taskValue
        }
    }).then(()  => showImaged())
}

function showImaged(){
    let clearImagedBtn = document.querySelector(".todo--images .clear-all");
    let imagedList = document.querySelector('.todo--images__list');
    imagedList.innerHTML = "";
    connection.select({
        from: "imaged"
    }).then((tasks) => {
        if(tasks.length === 0){
            imagedList.innerHTML = "<li class='empty-list'> No Task Exit </li>"
        }else{
            clearImagedBtn.addEventListener("click", function(){
                return connection.remove({
                    from: "imaged"
                }).then(() => showImaged());
            })
            for(let task of tasks){
                clearImagedBtn.addEventListener("click", function(){
                    fs.unlink(task.img_uri, (err) => {
                        if(err){
                            console.log(err);
                            return;
                        }
                    })
                })
                let listItem = document.createElement("li");
                let taskInput = document.createElement("input");
                let imageHolder = document.createElement("div");
                let taskImage = document.createElement("img");
                let deleteBTN = document.createElement("button");
                let buttonsHolder = document.createElement("div");
                let noteContentHolder = document.createElement("div");
                let updateBTN = document.createElement("button");
                let exportBTN = document.createElement("button");
                listItem.classList.add("li")
                deleteBTN.classList.add("deletebtn")
                updateBTN.classList.add("editbtn")
                exportBTN.classList.add("importbtn")
                taskInput.value = task.note;
                deleteBTN.innerHTML = "Delete";
                updateBTN.innerHTML = "Edit";
                exportBTN.innerHTML = "Export";
                buttonsHolder.classList.add("buttons-holder");
                taskImage.setAttribute("src", task.img_uri);
                deleteBTN.addEventListener("click", function(){
                    deleteImagedTask(task.id, task.img_uri)
                })
                updateBTN.addEventListener("click", function(){
                    updateImagedTask(task.id, taskInput.value);
                })
                exportBTN.addEventListener("click", function(){
                    ipcRenderer.send("create-txt", task.note);
                })
                buttonsHolder.appendChild(deleteBTN);
                buttonsHolder.appendChild(updateBTN);
                buttonsHolder.appendChild(exportBTN);
                
                imageHolder.appendChild(taskImage);
                noteContentHolder.appendChild(buttonsHolder)
               
                listItem.appendChild(imageHolder);
                listItem.appendChild(taskInput);
                imagedList.appendChild(listItem);
                listItem.appendChild(noteContentHolder)
                
            }
        }
    })
}

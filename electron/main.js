const {app, BrowserWindow,Menu, ipcMain,dialog, Tray,Notification} = require('electron')
const fs = require('fs');
const path = require("path")
const appPath = app.getPath("userData");


let mainWindow;
let addWindow ;
let addTimeWindow ;
let addImageWindow ;
let tray = null ;
process.env.NODE_ENV = "production";

app.on('ready', function(){
  mainWindow = new BrowserWindow({
    width:800,
    height: 600,
    webPreferences:{
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWindow.loadFile("index.html");
  mainWindow.on('closed', function(){
    app.quit();
  })
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
  mainWindow.on("minimize", function(event){
    event.preventDefault();
    mainWindow.hide()
  })
});

const mainMenuTemplate = [
  {
    label: 'Section',
    submenu: [
    {
      label: "Add New Task",
      click(){
        initAddWindow();
      }
    },
    {
     
        label: "Add Timeer Task",
        click(){
          createTimeWindow()
        }
      
    },
    {
     
      label: "Add New Task with image",
      click(){

        createIamgeWindow()
      }
    
  },
    {
      label: "exit",
      click(){
        app.quit();
      }
    }
  ]
},

]
if(process.env.NODE_ENV !== "production"){
  mainMenuTemplate.push({
  
      label: "Toggle Tools",
      submenu: [
        {
          label: "Open And Close Toggle Tools",
          click(){
            mainWindow.toggleDevTools();
          }
        },{
          label: "Reload The App",
          role: "reload"
        },
       
      ]
    }
    
  )
}
function initAddWindow(){
  addWindow = new BrowserWindow({
    width:400,
    height:300,
    webPreferences:{
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  addWindow.loadFile("./views/normalTask.html")
  addWindow.on('closed', (e) => {
    e.preventDefault();
    addWindow = null ;
  })
  addWindow.removeMenu();
}

ipcMain.on("add-noraml-task", function(e,item){
  mainWindow.webContents.send("add-noraml-task", item);
  addWindow.close();
})

ipcMain.on("create-txt" , function(e, note){
let dest = Date.now() + "-task.txt";
dialog.showSaveDialog({
  title: "Choose Place For Save File",
  defaultPath: path.join(__dirname, "./" + dest),
  buttonLabel: "Save",
  filters: [
    {
      name: "Text files",
      extensions: ["txt"]
    }
  ]
}).then(file => {
  if(!file.conceled){
    fs.writeFile(file.filePath.toString(), note  , function(err){
      if(err) throw err ;
    })
  }
}).catch(err => {
  console.log(err)
})
});
ipcMain.on("new-normal", function(e){
  initAddWindow();
});

function createTimeWindow(){
  addTimeWindow = new BrowserWindow({
    width:400,
    height: 420,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation:false
    }
  });
  addTimeWindow.loadFile(path.join(__dirname, "./views/timedTask.html"))

  addTimeWindow.on("closed", (e) => {
    e.preventDefault();
    addTimeWindow = null ;
  });

  addTimeWindow.removeMenu();
}

ipcMain.on("add-timed-note", function(e,note, notificationDate){
  mainWindow.webContents.send("add-timed-note", note , notificationDate);
  addTimeWindow.close();
  
})
ipcMain.on('open-timed-note', function (e) {
  createTimeWindow();
});


function createIamgeWindow(){
  addImageWindow = new BrowserWindow({
    width:400,
    height: 420,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation:false
    }
  });
  addImageWindow.loadFile(path.join(__dirname, "./views/imagedTask.html"));
  addImageWindow.on('closed' , (e) =>{
    e.preventDefault();
    addImageWindow = null 
  });
  addImageWindow.removeMenu();
}

ipcMain.on("upload-image", function(event){
  dialog.showOpenDialog({
    properties:["openFile"],
    filters: [
      {name: "images", extensions: ["jpg", "png", "gif"]}
    ]
  }).then(result => {
    event.sender.send("open-file", result.filePaths, appPath)
  })
})

ipcMain.on("add-imaged-task", function(e,note,imgURI){
  console.log(note,imgURI,'vvvww');
  mainWindow.webContents.send("add-imaged-task", note, imgURI);
  addImageWindow.close();
})
ipcMain.on("notify", function(e, taskValue){
  new Notification({
      title: "لديك تنبيه من مهامك",
      body: taskValue,
      icon: path.join(__dirname, "./assets/images/icon.png")
  }).show();
})
ipcMain.on("new-imaged", function(){
  createIamgeWindow();
})
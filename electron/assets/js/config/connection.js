const { data } = require('jquery');
const JsStore = require('jsstore');

let dbName = "electron_todo_db";

function getDbSechema(){
    let tblTasks = {
        name: "tasks",
        columns: {
            id: {primaryKey: true, autoIncrement: true},
            note: {notNull : true, dataType: "string"}
        }
    }

    let tblTimed = {
        name: "timed",
        columns: {
            id: {primaryKey: true , autoIncrement: true},
            note: {notNull: true , dataType: "string"},
            pick_status: {notNull: true , dataType: "number"},
            pick_time: {notNull: true , dataType: "date_time"},
        }
    }
    let tblImaged = {
        name: "imaged",
        columns: {
            id: {primaryKey: true , autoIncrement: true},
            note: {notNull: true , dataType: "string"},
            img_url: {notNull: true , dataType: "string"},
        }
    }
    let db = {
        name: dbName,
        tables: [tblTasks, tblTimed, tblImaged]
    }
    return db ;
}

var connection = new JsStore.Connection(
    new Worker("node_modules/jsstore/dist/jsstore.worker.js")

);
 

async function initJsStore(){
    let database = getDbSechema();
    let isDbCreated = await connection.initDb(database);
    if(isDbCreated === true){
        console.log("db created")
    } else{
        console.log("db opened")
    }
}

initJsStore();
module.exports = connection;
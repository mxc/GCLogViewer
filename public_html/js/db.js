function getDataStoreObject(dbName, version, schema) {

    var dbCon = createIndexedDBConnection(dbName, version, schema);
    return new DataStore(dbCon);

//======================================================

//      Schema is an array where the index is the db version number-1, with
//      the value being an object with propoerties for each objectstore which
//      in turn are objects listing params for objectstore creation and any
//      indexes that should be created.
//      
//      Later this will be used to keep track of db changes and apply them
//      to older versions of the database
//                      
//      var schema = [{
//                    gvEvent:{
//                        params: {autoIncrement:true},
//                        //indexs: [{'host','hostname',{unique=false}},....],
//                    }
//            }];

    function createIndexedDBConnection(dbName, version, schema) {
        var db = null;
        var schema = schema;
        var DBConnection = {
            dbName: dbName,
            version: version,
            init: function () {
                var request = window.indexedDB.open(dbName, version);
                request.onsuccess = function (e) {
                    db = request.result;
                    console.log("datastore already uptodate");
                    console.log("successfully connected to datastore");
                };
                request.onerror = function (e) {
                    console.log("There was an error " + e.message);
                    throw e;
                };
                request.onupgradeneeded = function (e) {
                    db = e.target.result;
                    var to = schema.length - 1 > version ? version : schema.length - 1;
                    for (var i = 0; i <= to; i++) {
                        var obj = schema[i];
                        var objectStores = Object.getOwnPropertyNames(obj);
                        objectStores.forEach(function (objStoreName, index, array) {
                            //if the params property is defined assume this is a new
                            //object store and attempt to create it.
                            if (obj[objStoreName].params !== undefined) {
                                try {
                                    var store = db.createObjectStore(objStoreName, obj[objStoreName].params);
                                } catch (e) {
                                    console.log(e.message);
                                }
                            }
                            var indices = obj[objStoreName].indices;
                            if (indices !== undefined) {
                                indices.forEach(function (data, index, array) {
                                    try {
                                        if (store === undefined) {
                                            store = e.currentTarget.transaction.objectStore(objStoreName);
                                        }
                                        store.createIndex(data[0], data[1], data[2]);
                                    } catch (e) {
                                        console.log(e.message);
                                    }
                                });
                            }
                        });
                    }
                    ;
                    console.log("updating database to latest verison");
                };
            },
            getObjectStoreFromTransaction: function (objectStore, mode, onComplete, onError) {
                var trans = db.transaction(objectStore, mode);
                trans.onComplete = onComplete;
                trans.onError = onError;
                return trans.objectStore(objectStore);
            },
            close: function () {
                db.close();
            },
            dropDataStore: function () {
                window.indexedDB.deleteDatabase(dbName);
                console.log("datastore dropped");
            },
            createDataStore: function () {
                this.init();
                console.log("datastore created");
            },
            retrieveObjectStore: function (cursorProvider) {
                if (typeof cursorProvider === 'string') {
                    return this.getObjectStoreFromTransaction(cursorProvider, "readonly",
                            function (event) {
                                console.log("worked");
                            }, function(event){ console.log(event.message)});
                }else{
                    return cursorProvider;
                }
            }

        };
        DBConnection.init();
        return DBConnection;
    }
    ;
}

//=====================================================
/*
 * 
 *  DataStore is the main entry point to the db.js
 *  api. It wraps the lower level DBConnection object
 *  returned from the createIndexDBConnection function.
 *  
 */


function DataStore(dbCon) {
    this.dbCon = dbCon;
}

DataStore.prototype.getObjectStoreFromTransaction = function (objStore, mode, success, failure) {
    var objStore = this.dbCon.getObjectStoreFromTransaction(objStore, mode,
            function (e) {
                console.log("success");
            },
            function (e) {
                console.log("failed");
            });
    return objStore;
};

DataStore.prototype.dropDataStore = function () {
    this.dbCon.close();
    this.dbCon.dropDataStore();
};

DataStore.prototype.createDataStore = function () {
    this.dbCon.createDataStore();
};

DataStore.prototype.insertObjectArray = function (objStore, objs) {
    var value = objs.shift();
    var that = this;
    if (value !== undefined && value !== null) {
        var request = objStore.add(value);
        request.onsuccess = function (e) {
            console.log("sucess");
            that.insertObjectArray(objStore, objs);
        };
        request.onerror = function (e) {
            console.log(e);
        };
    }
};

DataStore.prototype.insertObject = function (objStore, obj) {
    if (obj !== undefined && obj !== null) {
        var request = objStore.add(obj);
        request.onsuccess = function (e) {
            console.log("sucess");
        };
        request.onerror = function (e) {
            console.log(e);
        };
    }
};

DataStore.prototype.processObjectArray = function (cursorProvider, oneEachFunc,resultObj) {
    var results = [];
    var onSuccess = function (event) {
        console.log("opening cursor");
        var cursor = event.target.result;
        if (cursor) {
            results.push(cursor.value);
            cursor.continue();
        } else {
            oneEachFunc(results);
            resultObj.callback();
        }
    };
    var onError = function (e) {
        console.log(e.message);
    };
    cursorProvider = this.dbCon.retrieveObjectStore(cursorProvider);
    var request = cursorProvider.openCursor();
    request.onsuccess = onSuccess;
    request.onerror = onError;
    console.log("wait");
};

DataStore.prototype.processObjects = function (cursorProvider, onEachFunc,resultObj) {
    var request = cursorProvider.openCursor();
    request.onsuccess = function (event) {
        var cursor = event.target.result;
        if (cursor) {
            onEachFunc(cursor.value);
            cursor.continue();
        }else{
            resultObj.callback();
        }
    };
};


DataStore.prototype.findMax = function (objStore, property,resultObj) {
    var result=0;
    var func = function(event){
        result = event.result[property]>result? result:event.result;
        resultObj.result=result;
    };
    this.processObjects(objStore,func,callback);
};
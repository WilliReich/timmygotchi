// Initialize Localbase with 'timmyDB' as the database name
let TimmyDB = {
    db: new Localbase('timmyDB'),
    tableName: 'timmy',
    keyNeeds: 'needs',
    keyCustomize: 'customize',
};

// Save an object to the database under a specific key
TimmyDB.save = function (key, obj) {
    const data = JSON.stringify(obj);
    TimmyDB.db.collection(TimmyDB.tableName).doc(key).set({
        data
    }, key);
};

// Retrieve an object from the database using a specific key
TimmyDB.get = function (key) {
    return TimmyDB.db.collection(TimmyDB.tableName).doc(key).get().then(document => {
        if (document != null) {
            return JSON.parse(document.data);
        } else {
            return null;
        }
    });
};

// Save Timmy's needs data to the database
TimmyDB.saveNeeds = function (needsObj) {
    TimmyDB.save(TimmyDB.keyNeeds, needsObj);
};

// Save customization settings to the database
TimmyDB.saveCustomize = function (customizeObj) {
    TimmyDB.save(TimmyDB.keyCustomize, customizeObj);
};

// Retrieve Timmy's needs data from the database
TimmyDB.getNeeds = async function () {
    return await TimmyDB.get(TimmyDB.keyNeeds);
};

// Retrieve customization settings from the database
TimmyDB.getCustomize = async function () {
    return await TimmyDB.get(TimmyDB.keyCustomize);
};

export default TimmyDB;
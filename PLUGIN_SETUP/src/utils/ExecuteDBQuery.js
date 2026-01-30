import { openDatabase } from 'react-native-sqlite-storage';
import Global from '../screens/Global';
const db = openDatabase({ name: Global.dbName });

const ExecuteDBQuery = (query, successCallback, failureCallback) => {
    return new Promise((resolve, reject) => {
        try {
            db.transaction(tx => {
                tx.executeSql(
                    query,
                    null,
                    (txObj, resultSet) => {
                        successCallback(txObj, resultSet, resolve, reject);
                    },
                    (txObj, error) => {
                        console.log('Database Error : ', txObj.message);
                        failureCallback(txObj, error, resolve, reject);
                    },
                );
            });
        } catch (e) {
            console.log(e);
        }
    })
};

const DeleteMasterData = (masterName) => {
    let deleteQuery = "Delete From MASTER_DATA Where MASTER_NAME ='" + masterName + "'"
    try {
        db.transaction(tx => {
            tx.executeSql(
                deleteQuery,
                null,
                (resultSet) => {
                    console.log('Deleted : ', resultSet.rows.length);
                    return true;
                },
                (txObj, error) => {
                    console.log('Database Error : ', txObj.message);
                    return false;
                },
            );
        });
    } catch (e) {
        console.log(e);
        return false;
    }
    return true;
};

const ValidateExpiry = (masterName) => {
    let selectQuery = "Select EXPIRED_ON From MASTER_DATA_TIME_STAMP WHERE MASTER_NAME ='" + masterName + "'";
    return new Promise((resolve, reject) => {
        try {
            db.transaction(tx => {
                tx.executeSql(
                    selectQuery,
                    null,
                    (txObj, resultSet) => {
                        if (resultSet.rows.length > 0) {
                            const expiry = 1000 * 60 * 60 * 24 * 7;
                            const currentTime = new Date().getTime();
                            const expiryDate = Number(resultSet.rows.item(0).EXPIRED_ON) + expiry;
                            if (currentTime > expiryDate) {
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        }
                        else {
                            resolve(true);
                        }
                    },
                    (txObj, error) => {
                        console.log('Database Error : ', txObj.message);
                        resolve(true);
                    },
                );
            });
        } catch (e) {
            console.log(e);
        }
    })
};

const GetMasterJSONData = (masterName) => {
    let masterData = [];
    let selectQuery = "Select * From MASTER_DATA WHERE MASTER_NAME ='" + masterName + "'";
    return new Promise((resolve, reject) => {
        try {
            db.transaction(tx => {
                tx.executeSql(
                    selectQuery,
                    null,
                    (txObj, resultSet) => {
                        if (resultSet.rows.length > 0) {
                            masterData = resultSet.rows.item(0).DATA;
                        }
                        resolve(masterData);
                    },
                    (txObj, error) => {
                        console.log('Database Error : ', txObj.message);
                        resolve(masterData);
                    },
                );
            });
        } catch (e) {
            console.log(e);
            resolve(masterData);
        }
    })
};

const InsertMasterDataTimeStamp = (masterName) => {
    try {
        let insertQuery = "INSERT OR REPLACE INTO MASTER_DATA_TIME_STAMP (MASTER_NAME, EXPIRED_ON) VALUES ('" + masterName + "'," + new Date().getTime() + ");";
        db.transaction(tx => {
            tx.executeSql(
                insertQuery,
                null,
                (resultSet) => {
                    console.log('resultSet : ', resultSet);
                },
                (txObj, error) => {
                    console.log('Database Error : ', txObj.message);
                    return false;
                },
            )
        })
    } catch (e) {
        console.log(e);
        return false;
    }
    return true;
};

const InsertMasterData = (masterName, data) => {
    try {
        let insertQuery = "INSERT INTO MASTER_DATA (MASTER_NAME, DATA) VALUES ('" + masterName + "','" + JSON.stringify(data) + "')";
        db.transaction(tx => {
            tx.executeSql(
                insertQuery,
                null,
                (resultSet) => {
                    console.log('resultSet : ', resultSet);
                },
                (txObj, error) => {
                    console.log('Database Error : ', txObj.message);
                    return false;
                },
            )
        })
    } catch (e) {
        console.log(e);
        return false;
    }
    return true;
};

export { ExecuteDBQuery, DeleteMasterData, InsertMasterData, ValidateExpiry, InsertMasterDataTimeStamp, GetMasterJSONData };
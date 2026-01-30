import React, { useEffect, useState } from 'react';
import MainTabNavigator from './MainTabNavigator';
import MainTabNavigatorIntro from './MainTabNavigatorIntro';
import english from '../assets/languages/english.json'
import Global from '../screens/Global';
import SplashNavigator from './SplashNavigator';
import { ExecuteDBQuery } from '../utils/ExecuteDBQuery';

Global.languageData = english;

export default function AppNavigator() {
    let [displaySplash, setDisplaySplash] = useState(false);
    let [splashCheck, setSplashCheck] = useState(true);
    const createMasterTableQuery = 'CREATE TABLE IF NOT EXISTS MASTER_DATA (MASTER_NAME TEXT, DATA JSON)';
    const createUserTypeTableQuery = 'CREATE TABLE IF NOT EXISTS UserType (ID INTEGER PRIMARY KEY AUTOINCREMENT, Name TEXT, Desc TEXT)';
    const createDataFetchTimestampsTableQuery = 'CREATE TABLE IF NOT EXISTS DataFetchTimestamps (ID INTEGER PRIMARY KEY AUTOINCREMENT, MDMName TEXT, FetchedOn TEXT)';
    const createMasterDataTimeStampTableQuery = 'CREATE TABLE IF NOT EXISTS MASTER_DATA_TIME_STAMP (MASTER_NAME NAME, EXPIRED_ON TEXT)';
    const createBioMetricTableQuery = 'CREATE TABLE IF NOT EXISTS BioMetricTable (Biometric_Id TEXT, UserID TEXT)';
    const dropBioMetricTableQuery = 'Drop table BioMetricTable';
    const selectBioMetricTableQuery = 'SELECT * FROM BioMetricTable';

    useEffect(() => {
        createTables();
    }, []);

    const successCallback = (txObj, resultSet, resolve, reject) => {
        resolve(true);
    };

    const successSelectQueryCallback = (txObj, resultSet, resolve, reject) => {
        setSplashCheck(false);
        if (resultSet.rows.length > 0) {
            setDisplaySplash(false);
            Global.Biometric_Id = resultSet.rows.item(0).Biometric_Id;
        }
        else {
            setDisplaySplash(true);
            Global.Biometric_Id = '';
        }
        resolve(true);
    };

    const failureCallback = (txObj, error, resolve, reject) => {
        console.log('Creating Table Error : ', txObj.message);
        resolve(false);
    };

    const createTables = async () => {
        await ExecuteDBQuery(createMasterTableQuery, successCallback, failureCallback);
        await ExecuteDBQuery(createUserTypeTableQuery, successCallback, failureCallback);
        await ExecuteDBQuery(createDataFetchTimestampsTableQuery, successCallback, failureCallback);
        await ExecuteDBQuery(createMasterDataTimeStampTableQuery, successCallback, failureCallback);
        await ExecuteDBQuery(createBioMetricTableQuery, successCallback, failureCallback);
        await ExecuteDBQuery(selectBioMetricTableQuery, successSelectQueryCallback, failureCallback);
    }

    const DeleteData = async () => {
        await ExecuteDBQuery(dropBioMetricTableQuery, successCallback, failureCallback);
    }

    return (
        <>{
            splashCheck ?
                <SplashNavigator /> :
                displaySplash ?
                    <MainTabNavigatorIntro />
                    : <MainTabNavigator />}
        </>
    )
}
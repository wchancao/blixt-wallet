import { NativeModules } from "react-native";
import { SQLiteDatabase } from "react-native-sqlite-storage";
import { getWalletCreated, StorageItem, getItemObject, setItemObject, setItem, getItem } from "../storage/app";
import { getPin, getSeed, removeSeed, setSeed, setPin, removePin, setWalletPassword } from "../storage/keystore";
const { LndMobile } = NativeModules;

export interface IAppMigration {
  beforeLnd: (db: SQLiteDatabase, currentVersion: number) => Promise<void>;
}

export const appMigration: IAppMigration[] = [
  // Version 0
  {
    async beforeLnd(db, i) {},
  },
  // Version 1
  {
    async beforeLnd(db, i) {
      await LndMobile.writeConfigFile();
    },
  },
  // Version 2
  {
    async beforeLnd(db, i) {
      await setItemObject(StorageItem.clipboardInvoiceCheck, true);
      await LndMobile.writeConfigFile();
    },
  },
  // Version 3
  {
    async beforeLnd(db, i) {
      await NativeModules.LndMobileScheduledSync.setupScheduledSyncWork();
      await setItemObject(StorageItem.scheduledSyncEnabled, true);
      await setItemObject(StorageItem.lastScheduledSync, 0);
      await setItemObject(StorageItem.lastScheduledSyncAttempt, 0);
    },
  },
  // Version 4
  {
    async beforeLnd(db, i) {
      // Might not be needed:
      // const result = await NativeModules.LndMobile.deleteTLSCerts();
      // if (!result) {
      //   throw new Error("Failed to delete TLS certificates");
      // }
      await setItemObject(StorageItem.debugShowStartupInfo, false);
    },
  },
  // Version 5
  {
    async beforeLnd(db, i) {
      await db.executeSql("ALTER TABLE tx ADD tlvRecordName STRING");
    },
  },
  // Version 6
  {
    async beforeLnd(db, i) {
      await db.executeSql("ALTER TABLE tx ADD locationLong REAL");
      await db.executeSql("ALTER TABLE tx ADD locationLat REAL");
    },
  },
  // Version 6
  {
    async beforeLnd(db, i) {
      const password = await getItem(StorageItem.walletPassword);
      if (!password) {
        console.log("Cannot find wallet password");
        return;
      }

      await setWalletPassword(password);
    },
  },
];

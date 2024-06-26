import React, { createRef, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { storage } from '../../../App';
import { useMMKVStorage } from 'react-native-mmkv-storage';
import {
  SettingBooleanBox,
  SettingCategory,
  SettingDummyBox,
  SettingTextBox
} from '../../views/SettingViews';
import IonIcons from 'react-native-vector-icons/Ionicons';
import Dialog from 'react-native-dialog';
import DeviceControllerUtil from '../../util/DeviceControllerUtil';
import { useAppSelector } from '../../redux/hooks';
import { selectIsVotingsSyncing, selectIsDeviceOwner } from '../../redux/generalSlice';

function SettingsScreen(): React.JSX.Element {
  const serverAddressSettingBox = createRef<SettingTextBox>();
  const usernameSettingBox = createRef<SettingTextBox>();
  const accessKeySettingBox = createRef<SettingTextBox>();
  const kioskPinSettingBox = createRef<SettingTextBox>();
  const autoSyncSettingBox = createRef<SettingBooleanBox>();
  const syncPeriodSettingBox = createRef<SettingTextBox>();

  const [serverAddress, setServerAddress] = useMMKVStorage<string>('server_address', storage, '');
  const [username, setUsername] = useMMKVStorage<string>('username', storage, '');
  const [accessKey, setAccessKey] = useMMKVStorage<string>('access_key', storage, '');
  const [kioskPin, setKioskPin] = useMMKVStorage<string>('kiosk_pin', storage, '');
  const [autoSync, setAutoSync] = useMMKVStorage<boolean>('auto_sync', storage, false);
  const [syncPeriod, setSyncPeriod] = useMMKVStorage<string>('sync_period', storage, '60');

  const isSyncing = useAppSelector(selectIsVotingsSyncing);
  const isDeviceOwner = useAppSelector(selectIsDeviceOwner);

  const [editServerAddress, setEditServerAddress] = useState<string>('');
  const [editUsername, setEditUsername] = useState<string>('');
  const [editAccessKey, setEditAccessKey] = useState<string>('');
  const [editKioskPin, setEditKioskPin] = useState<string>('');
  const [editSyncPeriod, setEditSyncPeriod] = useState<string>('');

  const [deviceOwnerDialogOpen, setDeviceOwnerDialogOpen] = useState<boolean>(false);

  const warnings: string[] = [];

  if (isSyncing) {
    warnings.push(
      'Einige Einstellungen können während aktiver Synchronisation nicht geändert werden.'
    );
  }

  if (!isDeviceOwner) {
    warnings.push(
      'Der Kiosk-Modus funktioniert voraussichtlich nur eingeschränkt, weil die App kein Geräte-Admin ist.'
    );
  }

  const resetDeviceOwner = () => {
    DeviceControllerUtil.clearDeviceOwner()
      .then(() => setDeviceOwnerDialogOpen(false))
      .catch(() => setDeviceOwnerDialogOpen(false));
  };

  useEffect(() => {
    console.log('[Lifecycle] Mount - SettingsScreen');

    return () => {
      console.log('[Lifecycle] Unmount - SettingsScreen');
    };
  }, []);

  return (
    <View style={styles.container}>
      {warnings.map((warning, index) => (
        <View key={'warning_' + index} style={styles.warningContainer}>
          <IonIcons name="warning" size={20} color="#ef4444" />
          <Text style={styles.warningText}>{warning}</Text>
        </View>
      ))}
      <ScrollView style={styles.scrollView}>
        <SettingCategory label="Verbindung" />
        <SettingTextBox
          title="Server Adresse"
          hint={serverAddress ? serverAddress : 'Nicht festgelegt'}
          italicHint={!serverAddress}
          icon="server"
          firstSetting={true}
          autofocus={true}
          autoCapitalize={'none'}
          ref={serverAddressSettingBox}
          disabled={isSyncing}
          value={editServerAddress}
          onOpen={() => {
            setEditServerAddress(serverAddress);
          }}
          handleCancel={() => {
            serverAddressSettingBox.current?.setOpen(false);
            setEditServerAddress(serverAddress);
          }}
          handleSubmit={() => {
            serverAddressSettingBox.current?.setOpen(false);
            setServerAddress(editServerAddress);
          }}
          onChangeText={(text: string) => {
            setEditServerAddress(text.replace(/ /g, ''));
          }}
        />
        <SettingTextBox
          title="Nutzername"
          hint={username ? username : 'Nicht festgelegt'}
          italicHint={!username}
          icon="person"
          autofocus={true}
          autoCapitalize={'none'}
          ref={usernameSettingBox}
          disabled={isSyncing}
          value={editUsername}
          onOpen={() => {
            setEditUsername(username);
          }}
          handleCancel={() => {
            usernameSettingBox.current?.setOpen(false);
            setEditUsername(username);
          }}
          handleSubmit={() => {
            usernameSettingBox.current?.setOpen(false);
            setUsername(editUsername);
          }}
          onChangeText={(text) => {
            // do not use trim(), because also inner whitespaces should be replaced
            setEditUsername(text.replace(/ /g, ''));
          }}
        />
        <SettingTextBox
          title="Zugangsschlüssel"
          hint={accessKey ? '*****' : 'Nicht festgelegt'}
          italicHint={!accessKey}
          icon="key"
          autofocus={true}
          autoCapitalize={'none'}
          ref={accessKeySettingBox}
          disabled={isSyncing}
          value={editAccessKey}
          onOpen={() => {
            setEditAccessKey(accessKey);
          }}
          handleCancel={() => {
            accessKeySettingBox.current?.setOpen(false);
            setEditAccessKey(accessKey);
          }}
          handleSubmit={() => {
            accessKeySettingBox.current?.setOpen(false);
            setAccessKey(editAccessKey);
          }}
          onChangeText={(text: string) => {
            setEditAccessKey(text.replace(/ /g, ''));
          }}
        />
        <SettingCategory label="Sicherheit" />
        <SettingTextBox
          title="Kiosk-Modus Pin"
          hint={kioskPin ? kioskPin : 'Nicht festgelegt'}
          italicHint={!kioskPin}
          firstSetting={true}
          icon="keypad"
          autofocus={true}
          keyboardType="numeric"
          ref={kioskPinSettingBox}
          value={editKioskPin}
          maxLength={10}
          onOpen={() => {
            setEditKioskPin(kioskPin);
          }}
          handleCancel={() => {
            kioskPinSettingBox.current?.setOpen(false);
            setEditKioskPin(kioskPin);
          }}
          handleSubmit={() => {
            kioskPinSettingBox.current?.setOpen(false);
            setKioskPin(editKioskPin);
          }}
          onChangeText={(text) => {
            setEditKioskPin(text.replace(/[^0-9]/g, ''));
          }}
        />
        <SettingCategory label="Synchronisation" />
        <SettingBooleanBox
          title="Automatische Synchronisation"
          icon="sync"
          firstSetting={true}
          ref={autoSyncSettingBox}
          value={autoSync}
          onValueChange={() => {
            setAutoSync(!autoSync);
          }}
        />
        <SettingTextBox
          title="Rhythmus der Synchronisation"
          hint={syncPeriod + (parseInt(syncPeriod, 10) === 1 ? ' Minute' : ' Minuten')}
          icon="hourglass"
          autofocus={true}
          keyboardType="numeric"
          ref={syncPeriodSettingBox}
          value={editSyncPeriod}
          disabled={!autoSync}
          onOpen={() => {
            setEditSyncPeriod(syncPeriod);
          }}
          handleCancel={() => {
            syncPeriodSettingBox.current?.setOpen(false);
            setEditSyncPeriod(syncPeriod);
          }}
          handleSubmit={() => {
            syncPeriodSettingBox.current?.setOpen(false);
            if (!editSyncPeriod) {
              setEditSyncPeriod('60');
            }
            // TODO - add maximum and minimum
            setSyncPeriod(editSyncPeriod);
          }}
          onChangeText={(text) => {
            setEditSyncPeriod(text.replace(/[^0-9]/g, ''));
          }}
        />
        <SettingCategory label="Geräte-Administration" />
        <SettingDummyBox
          title="Geräte-Einstellungen öffnen"
          icon="settings"
          onPress={() => DeviceControllerUtil.openDeviceSettings()}
        />
        <SettingDummyBox
          title="Geräte-Admin entfernen"
          disabled={!isDeviceOwner}
          icon="remove-circle"
          onPress={() => setDeviceOwnerDialogOpen(true)}
        />
        <Dialog.Container
          visible={deviceOwnerDialogOpen}
          onBackdropPress={undefined}
          onRequestClose={undefined}>
          <Dialog.Title>Geräte-Admin entfernen</Dialog.Title>
          <Dialog.Description>
            Soll die App wirklich als Geräte-Admin entfernt werden?{'\n\n\n'}
            <Text style={styles.redText}>
              Der Kiosk-Modus wird danach NICHT mehr richtig funktionieren.
            </Text>
          </Dialog.Description>
          <Dialog.Button color="#ef4444" label="Bestätigen" onPress={() => resetDeviceOwner()} />
          <Dialog.Button
            color="#6404ec"
            label="Abbrechen"
            onPress={() => setDeviceOwnerDialogOpen(false)}
          />
        </Dialog.Container>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollView: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  warningContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: '#ffffff'
  },
  warningText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '400'
  },
  redText: {
    color: '#ef4444'
  }
});

export default SettingsScreen;

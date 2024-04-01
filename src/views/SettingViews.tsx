import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  InteractionManager,
  KeyboardType,
  Switch,
} from 'react-native';
import Dialog from 'react-native-dialog';
import IonIcons from 'react-native-vector-icons/Ionicons';

type SettingCategoryProps = {
  label: string;
};
export class SettingCategory extends React.Component<SettingCategoryProps> {
  render() {
    return (
      <View style={styles.settingHeadlineBox}>
        <Text numberOfLines={1} style={styles.settingHeadlineText}>
          {this.props.label}
        </Text>
      </View>
    );
  }
}

type SettingTextBoxProps = {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters' | undefined;
  autofocus?: boolean;
  dialogTitle?: string;
  dialogDescription?: string;
  dialogInputLabel?: string;
  dialogCancelLabel?: string;
  dialogSubmitLabel?: string;
  disabled?: boolean;
  firstSetting?: boolean;
  handleCancel?: () => any;
  handleSubmit?: () => any;
  hint: string;
  icon: string;
  italicHint?: boolean;
  keyboardType?: KeyboardType;
  maxLength?: number;
  onChangeText?: (text: string) => any;
  onOpen?: () => any;
  title: string;
  value: string;
};

type SettingTextBoxState = {
  dialogOpen: boolean;
};

export class SettingTextBox extends React.Component<
  SettingTextBoxProps,
  SettingTextBoxState
> {
  constructor(props: SettingTextBoxProps) {
    super(props);

    this.state = {
      dialogOpen: false,
    };

    this.setOpen = this.setOpen.bind(this);
    this.getInputRef = this.getInputRef.bind(this);
    this.defaultHandleButtons = this.defaultHandleButtons.bind(this);
  }

  private inputRef = React.createRef<any>();

  setOpen(open: boolean, callback?: () => void) {
    this.setState({...this.state, dialogOpen: open}, callback);
  }

  getInputRef() {
    return this.inputRef;
  }

  defaultHandleButtons() {
    this.setOpen(false);
  }

  render() {
    return (
      <TouchableHighlight
        activeOpacity={0.6}
        underlayColor="#F3F4F6"
        disabled={this.props.disabled}
        onPress={() => {
          if (!this.state.dialogOpen) {
            this.setOpen(true, () => {
              if (this.props.onOpen != null) {
                this.props.onOpen();
              }

              if (this.props.autofocus) {
                InteractionManager.runAfterInteractions(() => {
                  this.inputRef.current.focus();
                });
              }
            });
          }
        }}>
        <View
          style={
            this.props.disabled
              ? this.props.firstSetting
                ? [
                    styles.settingBox,
                    {
                      opacity: 0.6,
                      borderTopWidth: 0,
                    },
                  ]
                : [styles.settingBox, {opacity: 0.6}]
              : this.props.firstSetting
              ? [
                  styles.settingBox,
                  {
                    borderTopWidth: 0,
                  },
                ]
              : styles.settingBox
          }>
          <View style={styles.settingBoxInfoContainer}>
            <IonIcons name={this.props.icon} size={28} color="#505050" />
            <Text numberOfLines={1} style={styles.settingName}>
              {this.props.title}
            </Text>
          </View>
          <View style={styles.settingBoxSpacer} />
          <View style={styles.settingBoxHintContainer}>
            <Text
              numberOfLines={1}
              style={
                this.props.italicHint
                  ? [styles.settingHint, {fontStyle: 'italic'}]
                  : styles.settingHint
              }>
              {this.props.hint}
            </Text>
            <IonIcons name="chevron-forward" size={28} color="#ababab" />
          </View>
          <Dialog.Container
            visible={this.state.dialogOpen}
            onBackdropPress={
              this.props.handleCancel
                ? this.props.handleCancel
                : this.defaultHandleButtons
            }
            onRequestClose={
              this.props.handleCancel
                ? this.props.handleCancel
                : this.defaultHandleButtons
            }
            verticalButtons={false}>
            <Dialog.Title>
              {this.props.dialogTitle
                ? this.props.dialogTitle
                : this.props.title}
            </Dialog.Title>
            {this.props.dialogDescription && (
              <Dialog.Description>
                {this.props.dialogDescription}
              </Dialog.Description>
            )}
            <Dialog.Input
              label={this.props.dialogInputLabel}
              keyboardType={this.props.keyboardType}
              maxLength={this.props.maxLength}
              autoCapitalize={this.props.autoCapitalize}
              value={this.props.value}
              textInputRef={this.inputRef}
              onChangeText={this.props.onChangeText}
            />
            <Dialog.Button
              color="#6404ec"
              label={
                this.props.dialogCancelLabel
                  ? this.props.dialogCancelLabel
                  : 'Abbrechen'
              }
              onPress={
                this.props.handleCancel
                  ? this.props.handleCancel
                  : this.defaultHandleButtons
              }
            />
            <Dialog.Button
              color="#6404ec"
              label={
                this.props.dialogSubmitLabel
                  ? this.props.dialogSubmitLabel
                  : 'Bestätigen'
              }
              onPress={
                this.props.handleSubmit
                  ? this.props.handleSubmit
                  : this.defaultHandleButtons
              }
            />
          </Dialog.Container>
        </View>
      </TouchableHighlight>
    );
  }
}

type SettingBooleanBoxProps = {
  disabled?: boolean;
  firstSetting?: boolean;
  icon: string;
  onValueChange: (value: any) => any;
  title: string;
  value: boolean;
};

export class SettingBooleanBox extends React.Component<
  SettingBooleanBoxProps,
  any
> {
  constructor(props: SettingBooleanBoxProps) {
    super(props);
  }

  render() {
    return (
      <TouchableHighlight
        activeOpacity={0.6}
        underlayColor="#F3F4F6"
        disabled={this.props.disabled}
        onPress={this.props.onValueChange}>
        <View
          style={
            this.props.disabled
              ? this.props.firstSetting
                ? [
                    styles.settingBox,
                    {
                      opacity: 0.6,
                      borderTopWidth: 0,
                    },
                  ]
                : [styles.settingBox, {opacity: 0.6}]
              : this.props.firstSetting
              ? [
                  styles.settingBox,
                  {
                    borderTopWidth: 0,
                  },
                ]
              : styles.settingBox
          }>
          <View style={styles.settingBoxInfoContainer}>
            <IonIcons name={this.props.icon} size={28} color="#505050" />
            <Text numberOfLines={1} style={styles.settingName}>
              {this.props.title}
            </Text>
          </View>
          <View style={styles.settingBoxSpacer} />
          <View style={styles.settingBoxHintContainer}>
            <Switch
              thumbColor={this.props.value ? '#6404ec' : '#f4f3f4'}
              trackColor={{false: '#767577', true: '#35027d'}}
              disabled={this.props.disabled}
              value={this.props.value}
              onValueChange={this.props.onValueChange}
            />
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

type SettingDummyBoxProps = {
  disabled?: boolean;
  firstSetting?: boolean;
  icon: string;
  onPress: (value: any) => any;
  title: string;
};

export class SettingDummyBox extends React.Component<
  SettingDummyBoxProps,
  any
> {
  constructor(props: SettingDummyBoxProps) {
    super(props);
  }

  render() {
    return (
      <TouchableHighlight
        activeOpacity={0.6}
        underlayColor="#F3F4F6"
        disabled={this.props.disabled}
        onPress={this.props.onPress}>
        <View
          style={
            this.props.disabled
              ? this.props.firstSetting
                ? [
                    styles.settingBox,
                    {
                      opacity: 0.6,
                      borderTopWidth: 0,
                    },
                  ]
                : [styles.settingBox, {opacity: 0.6}]
              : this.props.firstSetting
              ? [
                  styles.settingBox,
                  {
                    borderTopWidth: 0,
                  },
                ]
              : styles.settingBox
          }>
          <View style={styles.settingBoxInfoContainer}>
            <IonIcons name={this.props.icon} size={28} color="#505050" />
            <Text numberOfLines={1} style={styles.settingName}>
              {this.props.title}
            </Text>
          </View>
          <View style={styles.settingBoxSpacer} />
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  settingHeadlineBox: {
    width: '100%',
    //backgroundColor: '#F3F4F6',
  },
  settingHeadlineText: {
    marginLeft: 20,
    paddingVertical: 10,
    fontWeight: '600',
    fontSize: 14,
    color: '#6404ec',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  settingBox: {
    width: '100%',
    height: 70,
    display: 'flex',
    flexDirection: 'row',
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderColor: '#e3e3e3',
    borderTopWidth: 1,
  },
  settingBoxInfoContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 15,
  },
  settingName: {
    fontSize: 18,
    fontWeight: '500',
    color: 'black',
    paddingRight: 10,
  },
  settingBoxSpacer: {
    flex: 1,
  },
  settingBoxHintContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 3,
  },
  settingHint: {
    fontSize: 18,
    color: '#616161',
    paddingLeft: 10,
  },
});

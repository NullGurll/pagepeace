/*******************************************************************************

    uBlock Origin - a comprehensive, efficient content blocker
    Copyright (C) 2014-present Raymond Hill

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/gorhill/uBlock
*/

import { dom, qs$, qsa$ } from './dom.js';
import { setAccentColor, setTheme } from './theme.js';
import { i18n$ } from './i18n.js';

/******************************************************************************/

function handleImportFilePicker() {
    const file = this.files[0];
    if ( file === undefined || file.name === '' ) { return; }

    const reportError = ( ) => {
        window.alert(i18n$('aboutRestoreDataError'));
    };

    const expectedFileTypes = [
        'text/plain',
        'application/json',
    ];
    if ( expectedFileTypes.includes(file.type) === false ) {
        return reportError();
    }

    const filename = file.name;
    const fr = new FileReader();

    fr.onload = function() {
        let userData;
        try {
            userData = JSON.parse(this.result);
            if ( typeof userData !== 'object' ) {
                throw 'Invalid';
            }
            if ( typeof userData.userSettings !== 'object' ) {
                throw 'Invalid';
            }
            if (
                Array.isArray(userData.whitelist) === false &&
                typeof userData.netWhitelist !== 'string'
            ) {
                throw 'Invalid';
            }
            if (
                typeof userData.filterLists !== 'object' &&
                Array.isArray(userData.selectedFilterLists) === false
            ) {
                throw 'Invalid';
            }
        }
        catch {
            userData = undefined;
        }
        if ( userData === undefined ) {
            return reportError();
        }
        const time = new Date(userData.timeStamp);
        const msg = i18n$('aboutRestoreDataConfirm')
                        .replace('{{time}}', time.toLocaleString());
        const proceed = window.confirm(msg);
        if ( proceed !== true ) { return; }
        vAPI.messaging.send('dashboard', {
            what: 'restoreUserData',
            userData,
            file: filename,
        });
    };

    fr.readAsText(file);
}

/******************************************************************************/

function startImportFilePicker() {
    const input = qs$('#restoreFilePicker');
    // Reset to empty string, this will ensure an change event is properly
    // triggered if the user pick a file, even if it is the same as the last
    // one picked.
    input.value = '';
    input.click();
}

/******************************************************************************/

async function exportToFile() {
    const response = await vAPI.messaging.send('dashboard', {
        what: 'backupUserData',
    });
    if (
        response instanceof Object === false ||
        response.userData instanceof Object === false
    ) {
        return;
    }
    vAPI.download({
        'url': 'data:text/plain;charset=utf-8,' +
               encodeURIComponent(JSON.stringify(response.userData, null, '  ')),
        'filename': response.localData.lastBackupFile
    });
    onLocalDataReceived(response.localData);
}

/******************************************************************************/

function onLocalDataReceived(details) {
    let v, unit;
    if ( typeof details.storageUsed === 'number' ) {
        v = details.storageUsed;
        if ( v < 1e3 ) {
            unit = 'genericBytes';
        } else if ( v < 1e6 ) {
            v /= 1e3;
            unit = 'KB';
        } else if ( v < 1e9 ) {
            v /= 1e6;
            unit = 'MB';
        } else {
            v /= 1e9;
            unit = 'GB';
        }
    } else {
        v = '?';
        unit = '';
    }
    dom.text(
        '#storageUsed',
        i18n$('storageUsed')
            .replace('{{value}}', v.toLocaleString(undefined, { maximumSignificantDigits: 3 }))
            .replace('{{unit}}', unit && i18n$(unit) || '')
    );

    const timeOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short'
    };

    const lastBackupFile = details.lastBackupFile || '';
    if ( lastBackupFile !== '' ) {
        const dt = new Date(details.lastBackupTime);
        const text = i18n$('settingsLastBackupPrompt');
        const node = qs$('#settingsLastBackupPrompt');
        node.textContent = text + '\xA0' + dt.toLocaleString('fullwide', timeOptions);
        node.style.display = '';
    }

    const lastRestoreFile = details.lastRestoreFile || '';
    if ( lastRestoreFile !== '' ) {
        const dt = new Date(details.lastRestoreTime);
        const text = i18n$('settingsLastRestorePrompt');
        const node = qs$('#settingsLastRestorePrompt');
        node.textContent = text + '\xA0' + dt.toLocaleString('fullwide', timeOptions);
        node.style.display = '';
    }

    if ( details.cloudStorageSupported === false ) {
        dom.attr('[data-setting-name="cloudStorageEnabled"]', 'disabled', '');
    }

    if ( details.privacySettingsSupported === false ) {
        dom.attr('[data-setting-name="prefetchingDisabled"]', 'disabled', '');
        dom.attr('[data-setting-name="hyperlinkAuditingDisabled"]', 'disabled', '');
        dom.attr('[data-setting-name="webrtcIPAddressHidden"]', 'disabled', '');
    }
}

/******************************************************************************/

function resetUserData() {
    const msg = i18n$('aboutResetDataConfirm');
    const proceed = window.confirm(msg);
    if ( proceed !== true ) { return; }
    vAPI.messaging.send('dashboard', {
        what: 'resetUserData',
    });
}

/******************************************************************************/

function synchronizeDOM() {
    dom.cl.toggle(
        dom.body,
        'advancedUser',
        qs$('[data-setting-name="advancedUserEnabled"]').checked === true
    );
}

/******************************************************************************/

function changeUserSettings(name, value) {
    vAPI.messaging.send('dashboard', {
        what: 'userSettings',
        name,
        value,
    });

    // Maybe reflect some changes immediately
    switch ( name ) {
    case 'uiTheme':
        setTheme(value, true);
        break;
    case 'uiAccentCustom':
    case 'uiAccentCustom0':
        setAccentColor(
            qs$('[data-setting-name="uiAccentCustom"]').checked,
            qs$('[data-setting-name="uiAccentCustom0"]').value,
            true
        );
        break;
    default:
        break;
    }
}

/******************************************************************************/

const visualPresets = {
    focus: { uiTheme: 'light', uiAccentCustom: true, uiAccentCustom0: '#2e7d5b', colorBlindFriendly: false },
    midnight: { uiTheme: 'dark', uiAccentCustom: true, uiAccentCustom0: '#8b7cff', colorBlindFriendly: false },
    contrast: { uiTheme: 'dark', uiAccentCustom: true, uiAccentCustom0: '#ffd400', colorBlindFriendly: true },
};

const layoutPresets = {
    minimal: 0b001,
    balanced: 0b111,
    expert: 0b11111,
};

function reflectSetting(name, value) {
    const input = qs$(`[data-setting-name="${name}"]`);
    if ( input === null ) { return; }
    if ( input.dataset.settingType === 'bool' ) {
        input.checked = value;
    } else {
        input.value = value;
    }
}

function showCustomizationStatus(text) {
    const node = qs$('#customizationStatus');
    node.textContent = text;
    self.setTimeout(( ) => {
        if ( node.textContent === text ) { node.textContent = ''; }
    }, 2400);
}

function applyVisualPreset(name) {
    const preset = visualPresets[name];
    if ( preset === undefined ) { return; }
    for ( const [ setting, value ] of Object.entries(preset) ) {
        reflectSetting(setting, value);
        changeUserSettings(setting, value);
    }
    setTheme(preset.uiTheme, true);
    setAccentColor(true, preset.uiAccentCustom0, true);
    qsa$('[data-visual-preset]').forEach(button => {
        dom.cl.toggle(button, 'active', button.dataset.visualPreset === name);
    });
    showCustomizationStatus(`${name[0].toUpperCase()}${name.slice(1)} preset applied.`);
}

function applyLayoutPreset(name) {
    const value = layoutPresets[name];
    if ( value === undefined ) { return; }
    changeUserSettings('popupPanelSections', value);
    qsa$('[data-layout-preset]').forEach(button => {
        dom.cl.toggle(button, 'active', button.dataset.layoutPreset === name);
    });
    showCustomizationStatus(`${name[0].toUpperCase()}${name.slice(1)} popup layout applied.`);
}

/******************************************************************************/

function onValueChanged(ev) {
    const input = ev.target;
    const name = dom.attr(input, 'data-setting-name');
    let value = input.value;
    // Maybe sanitize value
    switch ( name ) {
    case 'largeMediaSize':
        value = Math.min(Math.max(Math.floor(parseInt(value, 10) || 0), 0), 1000000);
        break;
    default:
        break;
    }
    if ( value !== input.value ) {
        input.value = value;
    }

    changeUserSettings(name, value);
}

/******************************************************************************/

// TODO: use data-* to declare simple settings

function onUserSettingsReceived(details) {
    const checkboxes = qsa$('[data-setting-type="bool"]');
    const onchange = ev => {
        const checkbox = ev.target;
        const name = checkbox.dataset.settingName || '';
        changeUserSettings(name, checkbox.checked);
        synchronizeDOM();
    };
    for ( const checkbox of checkboxes ) {
        const name = dom.attr(checkbox, 'data-setting-name') || '';
        if ( details[name] === undefined ) {
            dom.attr(checkbox.closest('.checkbox'), 'disabled', '');
            dom.attr(checkbox, 'disabled', '');
            continue;
        }
        checkbox.checked = details[name] === true;
        dom.on(checkbox, 'change', onchange);
    }

    if ( details.canLeakLocalIPAddresses === true ) {
        qs$('[data-setting-name="webrtcIPAddressHidden"]')
            .closest('div.li')
            .style.display = '';
    }

    qsa$('[data-setting-type="value"]').forEach(function(elem) {
        elem.value = details[dom.attr(elem, 'data-setting-name')];
        dom.on(elem, 'change', onValueChanged);
    });

    dom.on('#export', 'click', ( ) => { exportToFile(); });
    dom.on('#import', 'click', startImportFilePicker);
    dom.on('#reset', 'click', resetUserData);
    dom.on('#restoreFilePicker', 'change', handleImportFilePicker);
    qsa$('[data-visual-preset]').forEach(button => {
        dom.on(button, 'click', ( ) => { applyVisualPreset(button.dataset.visualPreset); });
    });
    qsa$('[data-layout-preset]').forEach(button => {
        dom.on(button, 'click', ( ) => { applyLayoutPreset(button.dataset.layoutPreset); });
    });

    synchronizeDOM();
}

/******************************************************************************/

self.wikilink = 'https://github.com/gorhill/uBlock/wiki/Dashboard:-Settings';

self.hasUnsavedData = function() {
    return false;
};

/******************************************************************************/

vAPI.messaging.send('dashboard', { what: 'userSettings' }).then(result => {
    onUserSettingsReceived(result);
});

vAPI.messaging.send('dashboard', { what: 'getLocalData' }).then(result => {
    onLocalDataReceived(result);
});

// https://github.com/uBlockOrigin/uBlock-issues/issues/591
dom.on(
    '[data-i18n-title="settingsAdvancedUserSettings"]',
    'click',
    self.uBlockDashboard.openOrSelectPage
);

/******************************************************************************/

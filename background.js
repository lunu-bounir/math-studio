'use strict';

chrome.browserAction.onClicked.addListener(() => chrome.tabs.create({
  url: 'data/studio/index.html'
}));

var onClicked = () => chrome.storage.local.get({
  mode: 'page',
  width: 800,
  height: 500
}, prefs => chrome.browserAction.setPopup({
  popup: prefs.mode !== 'page' ? `data/studio/index.html?width=${prefs.width}&height=${prefs.height}` : ''
}));

{
  const callback = () => chrome.storage.local.get({
    'mode': 'page'
  }, prefs => {
    chrome.contextMenus.create({
      id: 'mode:page',
      title: 'Open in a browser tab',
      type: 'radio',
      checked: prefs.mode === 'page',
      contexts: ['browser_action']
    });
    chrome.contextMenus.create({
      id: 'mode:popup',
      title: 'Open in popup',
      type: 'radio',
      checked: prefs.mode !== 'page',
      contexts: ['browser_action']
    });
    onClicked();
  });
  chrome.runtime.onInstalled.addListener(callback);
  chrome.runtime.onStartup.addListener(callback);
}
chrome.contextMenus.onClicked.addListener(info => chrome.storage.local.set({
  mode: info.menuItemId.replace('mode:', '')
}));

chrome.storage.onChanged.addListener(prefs => {
  if (prefs.mode) {
    onClicked();
  }
});

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
// FAQs & Feedback
chrome.runtime.onInstalled.addListener(() => {
  const {name, version} = chrome.runtime.getManifest();
  const page = chrome.runtime.getManifest().homepage_url;
  chrome.storage.local.get({
    'version': null,
    'faqs': true,
    'last-update': 0
  }, prefs => {
    if (prefs.version ? (prefs.faqs && prefs.version !== version) : true) {
      const now = Date.now();
      const doUpdate = (now - prefs['last-update']) / 1000 / 60 / 60 / 24 > 45;
      chrome.storage.local.set({
        version,
        'last-update': doUpdate ? Date.now() : prefs['last-update']
      }, () => {
        // do not display the FAQs page if last-update occurred less than 45 days ago.
        if (doUpdate) {
          const p = Boolean(prefs.version);
          chrome.tabs.create({
            url: page + '?version=' + version +
              '&type=' + (p ? ('upgrade&p=' + prefs.version) : 'install'),
            active: p === false
          });
        }
      });
    }
  });
  //
  chrome.runtime.setUninstallURL(page + '?rd=feedback&name=' + encodeURIComponent(name) + '&version=' + version);
});

'use strict';

const prettifierCheckbox = document.getElementById('toggle-prettifier');

const reformatJson = function(desiredFormat) {
    const shouldPrettify = desiredFormat === 'pretty';

    chrome.tabs.executeScript(null, {
        code: `shouldPrettify = ${shouldPrettify};`
    }, function() {
        chrome.tabs.executeScript(null, { file: '/content-scripts/reformat-on-toggle.js' });
    });
};

const togglePrettifier = function() {
    const prettifierEnabled = prettifierCheckbox.checked;

    chrome.storage.local.set({ shouldPrettify: prettifierEnabled }, () => {
        prettifierEnabled ? reformatJson('pretty') : reformatJson('minify');
    });
};

const getStoredPrettifiedStatus = function(callback) {
    const shouldPrettifyKeyName = 'shouldPrettify';

    chrome.storage.local.get(shouldPrettifyKeyName, (items) => {
        const { shouldPrettify } = items;

        if (typeof shouldPrettify !== 'boolean') {
            // default to true
            chrome.storage.local.set({ [shouldPrettifyKeyName]: true }, () => callback(true));
        } else {
            return callback(shouldPrettify);
        }
    });
};

// Set toggle state
getStoredPrettifiedStatus((shouldPrettify) => {
    prettifierCheckbox.checked = shouldPrettify;
});

prettifierCheckbox.addEventListener('click', togglePrettifier);

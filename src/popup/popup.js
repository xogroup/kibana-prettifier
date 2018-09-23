'use strict';

const prettifierCheckbox = document.getElementById('toggle-prettifier');
const shouldPrettifyKeyName = 'shouldPrettify';

// Gets "shouldPrettify" flag from local storage to initialize the state of the toggle
const readPrettifiedFlagFromLocalStorage = (setToggleState) => {
    chrome.storage.local.get(shouldPrettifyKeyName, (storedItems) => {
        const { shouldPrettify } = storedItems;

        if (typeof shouldPrettify !== 'boolean') {
            // Default to true if "shouldPrettify" hasn't been set in local storage yet.
            chrome.storage.local.set({ [shouldPrettifyKeyName]: true }, () => setToggleState(true));
        } else {
            return setToggleState(shouldPrettify);
        }
    });
};

// Initialize toggle state
readPrettifiedFlagFromLocalStorage((shouldPrettify) => {
    prettifierCheckbox.checked = shouldPrettify;
});

// When the toggle is updated, we will update the state of the "shouldPrettify" flag in local storage then send a message to a listener in our content script.
const togglePrettifier = () => {
    const prettifierEnabled = prettifierCheckbox.checked;

    // Update local storage
    chrome.storage.local.set({ [shouldPrettifyKeyName]: prettifierEnabled }, () => {
        // Find the active tab in the current window.
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            // Send a "message" to the content script which will listen for them and run a callback function.
            chrome.tabs.sendMessage(tabs[0].id, {shouldPrettify: prettifierEnabled});
        });
    });
};

prettifierCheckbox.addEventListener('click', togglePrettifier);

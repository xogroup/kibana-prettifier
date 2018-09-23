'use strict';

// If we had other content scripts, they would also have access to this variable because they run in the same scope.
let shouldPrettify;

// We add/remove these IDs on HTML elements containing JSON when we have prettified or minified them to make subsequent toggling easier.
const prettifiedId = 'prettified-json';
const minifiedId = 'minified-json';

// Tests whether a given input is JSON.
const isJson = (item) => {
    item = typeof item !== 'string' ? JSON.stringify(item) : item;

    try {
        item = JSON.parse(item);
    } catch (e) {
        return false;
    }

    if (typeof item === 'object' && item !== null) {
        return true;
    }

    return false;
};

// Gets "shouldPrettify" flag from local storage
const readPrettifiedFlagFromLocalStorage = (formatJsonBasedOnFlag) => {
    const shouldPrettifyKeyName = 'shouldPrettify';

    chrome.storage.local.get(shouldPrettifyKeyName, (storedItems) => {
        const { shouldPrettify } = storedItems;

        if (typeof shouldPrettify !== 'boolean') {
            // Default to true if "shouldPrettify" hasn't been set in local storage yet.
            chrome.storage.local.set({ [shouldPrettifyKeyName]: true }, () => formatJsonBasedOnFlag(true));
        } else {
            return formatJsonBasedOnFlag(shouldPrettify);
        }
    });
};

// This function will get called by the observer any time a dom node is added or removed.
const onDomNodeMutated = (mutationsList) => {
    // We read the "prettifyFlag" from local storage in case it has changed since the initial page load.
    // A callback is passed to readPrettifiedFlagFromLocalStorage that modifies the mutated DOM elements that contain JSON depending on the value of "prettifyFlag"
    readPrettifiedFlagFromLocalStorage((prettifyFlag) => {
        shouldPrettify = prettifyFlag;

        for (const mutation of mutationsList) {
            const isAddedValueDivWithJson = mutation.type === 'childList' && mutation.target.className === 'doc-viewer-value' && mutation.target.nodeName === 'DIV' && mutation.target.childElementCount === 0 && mutation.addedNodes.length && isJson(mutation.target.innerText);
            const notYetPrettified = mutation.target.id !== prettifiedId;
            const notYetMinified = mutation.target.id !== minifiedId;

            if (isAddedValueDivWithJson) {
                const divContainingJson = mutation.target;

                if (shouldPrettify && notYetPrettified) {
                    const innerHTML = mutation.target.innerHTML;
                    const parsedObject = JSON.parse(innerHTML);
                    const prettyInnerHTML = JSON.stringify(parsedObject, null, 2);

                    divContainingJson.innerHTML = prettyInnerHTML;
                    divContainingJson.setAttribute('id', prettifiedId);
                } else if (!shouldPrettify && notYetMinified) {
                    divContainingJson.setAttribute('id', minifiedId);
                }
            }
        }
    });
};

// Create a domObserver instance linked to the onDomNodeMutated function
const domObserver = new MutationObserver(onDomNodeMutated);

// Unfortunately we have to observe changes on the whole body because Kibana has only rendered a loading view when this script gets invoked.
const targetNode = document.body;

// Listen for node being added and removed on document.body and all the way down the tree.
const observerConfig = { childList: true, subtree: true };

// Start observing
// When a node is addded, we will test if it contains JSON and prettify or minify it depending on the stored "shouldPrettify" state.
// We will also add IDs to the HTML elements we modify so that subsequent toggling will be easier.
domObserver.observe(targetNode, observerConfig);

// Listen for any message sent from the popup when the toggle is flipped and minify/prettify the target elements.
chrome.runtime.onMessage.addListener(function(messageFromPopup) {
    const targetId = messageFromPopup.shouldPrettify ? minifiedId : prettifiedId;
    const newId = messageFromPopup.shouldPrettify ? prettifiedId : minifiedId;

    const targetJson = document.body.querySelectorAll(`div#${targetId}`);

    if (targetJson && targetJson.length) {
        for (const jsonDiv of targetJson) {
            const innerHTML = jsonDiv.innerHTML;
            const parsedObject = JSON.parse(innerHTML);
            const newInnerHTML = messageFromPopup.shouldPrettify ? JSON.stringify(parsedObject, null, 2) : JSON.stringify(parsedObject);

            jsonDiv.innerHTML = newInnerHTML;
            jsonDiv.innerText = newInnerHTML;
            jsonDiv.setAttribute('id', newId);
        }
    }
});

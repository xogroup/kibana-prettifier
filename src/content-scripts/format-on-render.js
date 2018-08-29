'use strict';

// These variables are accessible to the other content scripts (like reformat-on-toggle).
let shouldPrettify;

const prettifiedId = 'prettified-json';
const minifiedId = 'minified-json';

const isJson = function(item) {
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

const subscriber = function(mutationsList) {
    getStoredPrettifiedStatus((status) => {
        shouldPrettify = status;

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
                } else if (shouldPrettify === false && notYetMinified) {
                    divContainingJson.setAttribute('id', minifiedId);
                }
            }
        }
    });
};

// Create a domObserver instance linked to the subscriber function
const domObserver = new MutationObserver(subscriber);

// Unfortunately we have to observe changes on the whole body because Kibana has only rendered a loading view when this script gets invoked.
const targetNode = document.body;

// Listen for node being added and removed on document.body and all the way down the tree.
const config = { childList: true, subtree: true };

getStoredPrettifiedStatus(function(status) {
    // Set value for the global shouldPrettify variable.
    shouldPrettify = status;

    // Start observing
    domObserver.observe(targetNode, config);
});

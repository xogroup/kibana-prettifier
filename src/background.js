'use strict';

// This makes it so the popup is only accessible and the Chrome extension's icon only has a color on pages where it can be used.
chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {
                    urlContains: 'es.amazonaws.com/_plugin/kibana/app/kibana'
                }
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

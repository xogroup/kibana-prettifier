# Kibana Prettifier

This Chrome extension allows you to toggle in real-time between minifying and pretty-printing JSON in Kibana logs. The most recent state of the toggle is persisted in local storage so that the next time you load up Kibana, it will remember your preference.

Currently only configured to run on URLs matching this pattern `*://*.es.amazonaws.com/_plugin/kibana/app/kibana*` so it will only work if the Elasticsearch cluster is hosted in AWS.

This is currently only discoverable on the Chrome Extension store to members of XO Group's organization because I am too stingy to cough up the $5.00 to have it listed for everyone, but you should also be able to download it from this [direct link](https://chrome.google.com/webstore/detail/kibana-prettifier/fcpgbplmngakpnjggbaijlhfhohoflaa) to the Chrome Extension store.
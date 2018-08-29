'use strict';

if (typeof shouldPrettify === 'boolean') {
    const targetId = shouldPrettify ? minifiedId : prettifiedId;
    const newId = shouldPrettify ? prettifiedId : minifiedId;

    const targetJson = document.body.querySelectorAll(`div#${targetId}`);

    if (targetJson && targetJson.length) {
        for (const jsonDiv of targetJson) {
            const innerHTML = jsonDiv.innerHTML;
            const parsedObject = JSON.parse(innerHTML);
            const newInnerHTML = shouldPrettify ? JSON.stringify(parsedObject, null, 2) : JSON.stringify(parsedObject);

            jsonDiv.innerHTML = newInnerHTML;
            jsonDiv.innerText = newInnerHTML;
            jsonDiv.setAttribute('id', newId);
        }
    }
}

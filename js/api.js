async function saveToGoogleSheet(data) {

    const response = await fetch(API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },

        body: JSON.stringify({

            action: "save",

            ...data

        })

    });

    return await response.json();

}


async function searchFromGoogleSheet(query) {

    const url =
        API_URL +
        "?action=search&q=" +
        encodeURIComponent(query);

    const response =
        await fetch(url);

    return await response.json();

}


async function getAssets() {

    const url =
        API_URL +
        "?action=assets";

    const response =
        await fetch(url);

    return await response.json();

}
// ======================================================
// JSONP API CLIENT
// ======================================================

function jsonpRequest(params) {

    return new Promise(
        function(resolve, reject) {

            const callbackName =
                "itAssetCallback_" +
                Date.now() +
                "_" +
                Math.floor(
                    Math.random() * 100000
                );


            params.callback =
                callbackName;


            const query =
                new URLSearchParams(
                    params
                ).toString();


            const script =
                document.createElement(
                    "script"
                );


            let finished = false;


            const timeout =
                setTimeout(
                    function() {

                        if (finished)
                            return;


                        finished = true;


                        cleanup();


                        reject(
                            new Error(
                                "Google Sheet connection timeout"
                            )
                        );

                    },
                    20000
                );


            window[callbackName] =
                function(data) {

                    if (finished)
                        return;


                    finished = true;


                    clearTimeout(
                        timeout
                    );


                    cleanup();


                    resolve(data);

                };


            function cleanup() {

                delete window[
                    callbackName
                ];


                if (
                    script.parentNode
                ) {

                    script.parentNode
                        .removeChild(
                            script
                        );

                }

            }


            script.src =
                API_URL +
                "?" +
                query;


            script.async = true;


            script.onerror =
                function() {

                    if (finished)
                        return;


                    finished = true;


                    clearTimeout(
                        timeout
                    );


                    cleanup();


                    reject(
                        new Error(
                            "Unable to connect with Google Sheet"
                        )
                    );

                };


            document.body.appendChild(
                script
            );

        }
    );

}


// ======================================================
// TEST API
// ======================================================

async function testAPI() {

    return await jsonpRequest({

        action: "test"

    });

}


// ======================================================
// SAVE ASSET
// ======================================================

async function saveToGoogleSheet(
    data
) {

    return await jsonpRequest({

        action: "save",


        surveyDate:
            data.surveyDate,

        surveyedBy:
            data.surveyedBy,


        department:
            data.department,

        location:
            data.location,

        building:
            data.building,

        floor:
            data.floor,

        room:
            data.room,


        employeeName:
            data.employeeName,

        employeeId:
            data.employeeId,

        designation:
            data.designation,


        assetType:
            data.assetType,

        assetTag:
            data.assetTag,

        serialNumber:
            data.serialNumber,

        brand:
            data.brand,

        model:
            data.model,


        hostname:
            data.hostname,

        ipAddress:
            data.ipAddress,

        macAddress:
            data.macAddress,


        operatingSystem:
            data.operatingSystem,

        processor:
            data.processor,

        ram:
            data.ram,

        storage:
            data.storage,

        graphics:
            data.graphics,

        configuration:
            data.configuration,


        workingStatus:
            data.workingStatus,

        physicalCondition:
            data.physicalCondition,

        damageDetails:
            data.damageDetails,


        remarks:
            data.remarks

    });

}


// ======================================================
// SEARCH
// ======================================================

async function searchFromGoogleSheet(
    query
) {

    return await jsonpRequest({

        action: "search",

        q: query

    });

}


// ======================================================
// GET ALL
// ======================================================

async function getAssets() {

    return await jsonpRequest({

        action: "assets"

    });

}

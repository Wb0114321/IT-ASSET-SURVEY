// ======================================================
// IT ASSET SURVEY APPLICATION
// ======================================================

let scanner = null;


// ======================================================
// DOM READY
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateStats();

    }
);


// ======================================================
// BARCODE SCANNER
// ======================================================

function openScanner() {

    const box =
        document.getElementById(
            "scannerBox"
        );


    box.style.display =
        "block";


    if (scanner) {
        return;
    }


    scanner =
        new Html5Qrcode(
            "reader"
        );


    scanner.start(

        {
            facingMode:
                "environment"
        },

        {

            fps: 10,

            qrbox: {

                width: 280,

                height: 160

            },

            formatsToSupport: [

                Html5QrcodeSupportedFormats
                    .QR_CODE,

                Html5QrcodeSupportedFormats
                    .CODE_128,

                Html5QrcodeSupportedFormats
                    .CODE_39,

                Html5QrcodeSupportedFormats
                    .CODE_93,

                Html5QrcodeSupportedFormats
                    .EAN_13,

                Html5QrcodeSupportedFormats
                    .EAN_8,

                Html5QrcodeSupportedFormats
                    .UPC_A,

                Html5QrcodeSupportedFormats
                    .UPC_E

            ]

        },

        function(decodedText) {

            const serial =
                document.getElementById(
                    "serialNumber"
                );


            serial.value =
                decodedText.trim();


            showToast(
                "Barcode scanned successfully",
                "success"
            );


            closeScanner();

        },

        function(errorMessage) {

            // Ignore continuous scan errors

        }

    )
    .catch(
        function(error) {

            console.error(
                "Scanner Error:",
                error
            );


            showToast(
                "Camera permission denied or unavailable",
                "error"
            );


            box.style.display =
                "none";


            scanner =
                null;

        }
    );

}


// ======================================================
// CLOSE SCANNER
// ======================================================

function closeScanner() {

    const box =
        document.getElementById(
            "scannerBox"
        );


    if (scanner) {

        scanner.stop()

            .then(
                function() {

                    scanner.clear();

                    scanner = null;

                    box.style.display =
                        "none";

                }
            )

            .catch(
                function(error) {

                    console.log(
                        error
                    );

                    scanner =
                        null;

                    box.style.display =
                        "none";

                }
            );

    } else {

        box.style.display =
            "none";

    }

}


// ======================================================
// SAVE ASSET
// ======================================================

async function saveAsset() {

    const department =
        value(
            "department"
        );


    const assetType =
        value(
            "assetType"
        );


    const serialNumber =
        value(
            "serialNumber"
        );


    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    if (!department) {

        showToast(
            "Department is required",
            "error"
        );

        focusField(
            "department"
        );

        return;

    }


    if (!assetType) {

        showToast(
            "Asset Type is required",
            "error"
        );

        focusField(
            "assetType"
        );

        return;

    }


    if (!serialNumber) {

        showToast(
            "Serial Number is required",
            "error"
        );

        focusField(
            "serialNumber"
        );

        return;

    }


    // --------------------------------------------------
    // DATA
    // --------------------------------------------------

    const data = {

        surveyDate:
            getToday(),


        surveyedBy:
            localStorage.getItem(
                "surveyedBy"
            ) ||
            "IT Team",


        department:
            department,

        location:
            value("location"),

        building:
            value("building"),

        floor:
            value("floor"),

        room:
            value("room"),


        employeeName:
            value("employeeName"),

        employeeId:
            value("employeeId"),

        designation:
            value("designation"),


        assetType:
            assetType,

        assetTag:
            value("assetTag"),

        serialNumber:
            serialNumber,

        brand:
            value("brand"),

        model:
            value("model"),


        hostname:
            value("hostname"),

        ipAddress:
            value("ipAddress"),

        macAddress:
            value("macAddress"),


        operatingSystem:
            value(
                "operatingSystem"
            ),

        processor:
            value("processor"),

        ram:
            value("ram"),

        storage:
            value("storage"),

        graphics:
            value("graphics"),

        configuration:
            value(
                "configuration"
            ),


        workingStatus:
            value(
                "workingStatus"
            ),

        physicalCondition:
            value(
                "physicalCondition"
            ),

        damageDetails:
            value(
                "damageDetails"
            ),


        remarks:
            value("remarks")

    };


    // --------------------------------------------------
    // BUTTON
    // --------------------------------------------------

    const button =
        document.querySelector(
            ".save-btn"
        );


    button.disabled =
        true;


    button.innerText =
        "⏳ Saving...";


    try {

        const result =
            await saveToGoogleSheet(
                data
            );


        console.log(
            "SAVE RESULT:",
            result
        );


        if (
            result &&
            result.success
        ) {

            showToast(
                "Asset saved successfully!",
                "success"
            );


            resetForm();


            updateStats();


        } else {

            showToast(

                result &&
                result.message

                    ? result.message

                    : "Save failed",

                "error"

            );

        }

    }

    catch(error) {

        console.error(
            "SAVE ERROR:",
            error
        );


        showToast(
            error.message ||
            "Unable to connect with Google Sheet",
            "error"
        );

    }


    finally {

        button.disabled =
            false;


        button.innerText =
            "💾 SAVE ASSET";

    }

}


// ======================================================
// SEARCH
// ======================================================

async function searchAsset() {

    const query =
        value(
            "searchInput"
        );


    if (!query) {

        showToast(
            "Enter search text",
            "error"
        );

        return;

    }


    const container =
        document.getElementById(
            "searchResults"
        );


    container.innerHTML =
        `
        <div class="loading">
            🔍 Searching...
        </div>
        `;


    try {

        const result =
            await searchFromGoogleSheet(
                query
            );


        if (
            !result ||
            !result.success
        ) {

            container.innerHTML =
                `
                <div class="no-result">
                    Search failed
                </div>
                `;

            return;

        }


        if (
            !result.data ||
            !result.data.length
        ) {

            container.innerHTML =
                `
                <div class="no-result">
                    No asset found.
                </div>
                `;

            return;

        }


        container.innerHTML =
            "";


        result.data.forEach(
            function(row) {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "result";


                div.innerHTML = `

                    <div class="result-top">

                        <strong>
                            ${escapeHtml(
                                row[13] ||
                                "No Serial"
                            )}
                        </strong>

                        <span class="result-id">
                            ${escapeHtml(
                                row[0] ||
                                ""
                            )}
                        </span>

                    </div>


                    <div class="result-grid">

                        <span>
                            <b>Department</b>
                            ${escapeHtml(
                                row[3] ||
                                "-"
                            )}
                        </span>

                        <span>
                            <b>Asset</b>
                            ${escapeHtml(
                                row[11] ||
                                "-"
                            )}
                        </span>

                        <span>
                            <b>Brand</b>
                            ${escapeHtml(
                                row[14] ||
                                "-"
                            )}
                        </span>

                        <span>
                            <b>Model</b>
                            ${escapeHtml(
                                row[15] ||
                                "-"
                            )}
                        </span>

                        <span>
                            <b>Employee</b>
                            ${escapeHtml(
                                row[8] ||
                                "-"
                            )}
                        </span>

                        <span>
                            <b>Location</b>
                            ${escapeHtml(
                                row[4] ||
                                "-"
                            )}
                        </span>

                    </div>

                `;


                container.appendChild(
                    div
                );

            }
        );

    }

    catch(error) {

        console.error(
            "SEARCH ERROR:",
            error
        );


        container.innerHTML =
            `
            <div class="no-result">
                Unable to connect with Google Sheet
            </div>
            `;

    }

}


// ======================================================
// RESET FORM
// ======================================================

function resetForm() {

    const fields =
        document.querySelectorAll(
            "input, textarea, select"
        );


    fields.forEach(
        function(element) {

            if (
                element.id !==
                "searchInput"
            ) {

                element.value =
                    "";

            }

        }
    );


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ======================================================
// UPDATE STATS
// ======================================================

async function updateStats() {

    try {

        const result =
            await getAssets();


        if (
            !result ||
            !result.success
        ) {

            return;

        }


        document.getElementById(
            "totalCount"
        ).innerText =
            result.count;


        const today =
            getToday();


        let count =
            0;


        result.data.forEach(
            function(row) {

                const surveyDate =
                    row[1];


                if (
                    surveyDate &&
                    String(
                        surveyDate
                    ).includes(
                        today
                    )
                ) {

                    count++;

                }

            }
        );


        document.getElementById(
            "todayCount"
        ).innerText =
            count;

    }

    catch(error) {

        console.log(
            "Stats error:",
            error
        );

    }

}


// ======================================================
// TODAY
// ======================================================

function getToday() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


// ======================================================
// GET VALUE
// ======================================================

function value(id) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {
        return "";
    }


    return element.value.trim();

}


// ======================================================
// FOCUS
// ======================================================

function focusField(id) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.focus();

    }

}


// ======================================================
// TOAST
// ======================================================

function showToast(
    message,
    type = ""
) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.innerText =
        message;


    toast.className =
        "toast " +
        type;


    toast.style.display =
        "block";


    setTimeout(
        function() {

            toast.style.display =
                "none";

        },
        3500
    );

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(
    value
) {

    return String(
        value
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}

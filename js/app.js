let scanner = null;


// ==========================================
// OPEN SCANNER
// ==========================================

function openScanner() {

    const box =
        document.getElementById("scannerBox");

    box.style.display = "block";


    scanner =
        new Html5Qrcode("reader");


    scanner.start(

        {
            facingMode: "environment"
        },

        {
            fps: 10,

            qrbox: {
                width: 250,
                height: 150
            },

            formatsToSupport: [
                Html5QrcodeSupportedFormats.QR_CODE,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.CODE_39,
                Html5QrcodeSupportedFormats.CODE_93,
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E
            ]

        },

        function(decodedText) {

            document.getElementById(
                "serialNumber"
            ).value = decodedText;


            showToast(
                "Barcode scanned successfully",
                "success"
            );


            closeScanner();

        },

        function(errorMessage) {

            // Scanner continuously tries.
            // No need to show every error.

        }

    )
    .catch(function(error) {

        console.error(error);

        showToast(
            "Camera permission required",
            "error"
        );

    });

}


// ==========================================
// CLOSE SCANNER
// ==========================================

function closeScanner() {

    const box =
        document.getElementById("scannerBox");


    if (scanner) {

        scanner.stop()

            .then(function() {

                scanner.clear();

                scanner = null;

            })

            .catch(function(error) {

                console.log(error);

            });

    }


    box.style.display = "none";

}


// ==========================================
// SAVE ASSET
// ==========================================

async function saveAsset() {

    const department =
        value("department");

    const assetType =
        value("assetType");

    const serialNumber =
        value("serialNumber");


    if (!department) {

        showToast(
            "Department is required",
            "error"
        );

        return;

    }


    if (!assetType) {

        showToast(
            "Asset Type is required",
            "error"
        );

        return;

    }


    if (!serialNumber) {

        showToast(
            "Serial Number is required",
            "error"
        );

        return;

    }


    const data = {

        surveyDate:
            new Date()
            .toISOString()
            .split("T")[0],

        surveyedBy:
            localStorage.getItem(
                "surveyedBy"
            ) || "IT Team",


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
            value("operatingSystem"),

        processor:
            value("processor"),

        ram:
            value("ram"),

        storage:
            value("storage"),

        graphics:
            value("graphics"),

        configuration:
            value("configuration"),


        workingStatus:
            value("workingStatus"),

        physicalCondition:
            value("physicalCondition"),

        damageDetails:
            value("damageDetails"),


        assetPhoto:
            "",

        barcodePhoto:
            "",


        remarks:
            value("remarks")

    };


    const button =
        document.querySelector(
            ".save-btn"
        );


    button.disabled = true;

    button.innerText =
        "Saving...";


    try {

        const result =
            await saveToGoogleSheet(data);


        if (result.success) {

            showToast(
                "Asset saved successfully!",
                "success"
            );


            resetForm();


            updateStats();

        } else {

            showToast(
                result.message ||
                "Save failed",
                "error"
            );

        }

    }

    catch(error) {

        console.error(error);

        showToast(
            "Unable to connect with Google Sheet",
            "error"
        );

    }

    finally {

        button.disabled = false;

        button.innerText =
            "💾 SAVE ASSET";

    }

}


// ==========================================
// SEARCH
// ==========================================

async function searchAsset() {

    const query =
        value("searchInput");


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
        "<p>Searching...</p>";


    try {

        const result =
            await searchFromGoogleSheet(
                query
            );


        if (!result.success) {

            container.innerHTML =
                "<p>Search failed</p>";

            return;

        }


        if (!result.data.length) {

            container.innerHTML =
                "<p>No asset found.</p>";

            return;

        }


        container.innerHTML = "";


        result.data.forEach(function(row) {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "result";


            div.innerHTML = `

                <strong>
                    ${escapeHtml(row[13] || "No Serial")}
                </strong>

                <small>
                    ${escapeHtml(row[3] || "")}
                    ·
                    ${escapeHtml(row[11] || "")}
                    ·
                    ${escapeHtml(row[14] || "")}
                    ${escapeHtml(row[15] || "")}
                    <br>
                    Employee:
                    ${escapeHtml(row[8] || "-")}
                    <br>
                    Location:
                    ${escapeHtml(row[4] || "-")}
                </small>

            `;


            container.appendChild(div);

        });


    }

    catch(error) {

        console.error(error);

        container.innerHTML =
            "<p>Unable to search.</p>";

    }

}


// ==========================================
// RESET
// ==========================================

function resetForm() {

    document
        .querySelectorAll(
            "input, textarea, select"
        )
        .forEach(function(element) {

            if (
                element.id !==
                "searchInput"
            ) {

                element.value = "";

            }

        });

}


// ==========================================
// STATS
// ==========================================

async function updateStats() {

    try {

        const result =
            await getAssets();


        if (!result.success) return;


        document.getElementById(
            "totalCount"
        ).innerText =
            result.count;


        const today =
            new Date()
            .toISOString()
            .split("T")[0];


        let count = 0;


        result.data.forEach(
            function(row) {

                const date =
                    row[1];

                if (
                    date &&
                    String(date)
                    .includes(today)
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

        console.log(error);

    }

}


// ==========================================
// VALUE HELPER
// ==========================================

function value(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";

}


// ==========================================
// TOAST
// ==========================================

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
        "toast " + type;


    toast.style.display =
        "block";


    setTimeout(function() {

        toast.style.display =
            "none";

    }, 3000);

}


// ==========================================
// SECURITY
// ==========================================

function escapeHtml(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateStats();

    }
);
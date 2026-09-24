/* =======================================================
   LIVE PIPELINE LEAK DETECTION DASHBOARD
======================================================= */

/*
   IMPORTANT:
   This URL is your current Cloudflare Quick Tunnel.

   If you restart the Cloudflare Quick Tunnel,
   the URL will change and this value must be updated.
*/

const BRIDGE_URL =
    "https://ontario-positioning-pure-desktop.trycloudflare.com";


/* =======================================================
   ELEMENT HELPERS
======================================================= */

function getElement(id) {
    return document.getElementById(id);
}


/* =======================================================
   CONNECTION STATUS
======================================================= */

async function checkConnection() {

    const dot =
        getElement("connectionDot");

    const text =
        getElement("connectionText");

    try {

        const response = await fetch(
            `${BRIDGE_URL}/latest`,
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error("Bridge unavailable");
        }

        const data = await response.json();

        if (data.bridge_status === "online") {

            dot.classList.add("online");

            text.textContent =
                "LIVE SYSTEM ONLINE";

        } else {

            dot.classList.remove("online");

            text.textContent =
                "BRIDGE ERROR";
        }

    } catch (error) {

        console.error(
            "Connection error:",
            error
        );

        dot.classList.remove("online");

        text.textContent =
            "SYSTEM OFFLINE";
    }
}


/* =======================================================
   UPDATE LIVE DASHBOARD
======================================================= */

async function updateDashboard() {

    try {

        const response = await fetch(
            `${BRIDGE_URL}/latest`,
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                "Unable to read live data"
            );
        }

        const data =
            await response.json();


        /* ------------------------------------------------
           SENSOR DATA
        ------------------------------------------------ */

        const sensor =
            data.sensor;

        if (sensor) {

            getElement("qin").textContent =
                Number(sensor.qin_lph)
                    .toFixed(2) + " LPH";


            getElement("qout").textContent =
                Number(sensor.qout_lph)
                    .toFixed(2) + " LPH";


            getElement("dp").textContent =
                Number(sensor.delta_p_bar)
                    .toFixed(5) + " bar";


            getElement("deficit").textContent =
                Number(sensor.flow_deficit_lph)
                    .toFixed(2) + " LPH";
        }


        /* ------------------------------------------------
           ML RESULT
        ------------------------------------------------ */

        const ml =
            data.ml;

        if (ml) {

            const prediction =
                ml.prediction;

            const probability =
                Number(
                    ml.leak_probability
                );


            getElement("prediction").textContent =
                prediction;


            getElement("probability").textContent =
                (probability * 100)
                    .toFixed(2) + "%";


            /* --------------------------------------------
               STATUS CARD
            -------------------------------------------- */

            const statusCard =
                document.querySelector(
                    ".status-card"
                );

            if (statusCard) {

                statusCard.classList.remove(
                    "leak",
                    "normal"
                );


                if (prediction === "LEAK") {

                    statusCard.classList.add(
                        "leak"
                    );

                } else {

                    statusCard.classList.add(
                        "normal"
                    );
                }
            }
        }


        /* ------------------------------------------------
           SIMULATOR INFORMATION
        ------------------------------------------------ */

        const simulator =
            data.simulator;

        if (simulator) {

            const leakPercentage =
                Number(
                    simulator.leak_percentage
                );


            /*
               Show leak location only when
               a leak is actually active.
            */

            const locationElement =
                getElement("leakLocation");

            if (locationElement) {

                if (
                    simulator.leak_flag === 1
                ) {

                    locationElement.textContent =
                        Number(
                            simulator.leak_location
                        ).toFixed(1) + " m";

                } else {

                    locationElement.textContent =
                        "—";
                }
            }


            const severityElement =
                getElement("leakSeverity");

            if (severityElement) {

                if (
                    simulator.leak_flag === 1
                ) {

                    severityElement.textContent =
                        leakPercentage.toFixed(1) + "%";

                } else {

                    severityElement.textContent =
                        "—";
                }
            }
        }


        /* ------------------------------------------------
           TIMESTAMP
        ------------------------------------------------ */

        const timestampElement =
            getElement("timestamp");

        if (
            timestampElement &&
            data.timestamp
        ) {

            timestampElement.textContent =
                data.timestamp;
        }


        /* ------------------------------------------------
           BRIDGE STATUS
        ------------------------------------------------ */

        const dot =
            getElement("connectionDot");

        const text =
            getElement("connectionText");


        if (
            data.bridge_status ===
            "online"
        ) {

            dot.classList.add(
                "online"
            );

            text.textContent =
                "LIVE SYSTEM ONLINE";

        } else {

            dot.classList.remove(
                "online"
            );

            text.textContent =
                "SYSTEM ERROR";
        }


    } catch (error) {

        console.error(
            "Dashboard update error:",
            error
        );


        const dot =
            getElement("connectionDot");

        const text =
            getElement("connectionText");


        dot.classList.remove(
            "online"
        );

        text.textContent =
            "SYSTEM OFFLINE";
    }
}


/* =======================================================
   SEND COMMAND TO BRIDGE
======================================================= */

async function sendCommand(
    endpoint
) {

    try {

        const response =
            await fetch(
                `${BRIDGE_URL}${endpoint}`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Command failed"
            );
        }


        console.log(
            "Command successful:",
            endpoint,
            data
        );


        /*
           Give the simulator a moment to
           generate the new state.
        */

        setTimeout(
            updateDashboard,
            500
        );


        return data;


    } catch (error) {

        console.error(
            "Command error:",
            error
        );


        alert(
            "Unable to send command.\n\n" +
            error.message
        );
    }
}


/* =======================================================
   SIMULATION CONTROLS
======================================================= */

async function startSimulation() {

    await sendCommand(
        "/start"
    );
}


async function stopSimulation() {

    await sendCommand(
        "/stop"
    );
}


/* =======================================================
   LEAK CONTROLS
======================================================= */

async function randomLeak() {

    await sendCommand(
        "/random-leak"
    );
}


async function clearLeak() {

    await sendCommand(
        "/clear-leak"
    );
}


async function autoLeak() {

    await sendCommand(
        "/auto-leak"
    );
}


async function setLeak5() {

    await sendCommand(
        "/leak5"
    );
}


async function setLeak10() {

    await sendCommand(
        "/leak10"
    );
}


async function setLeak20() {

    await sendCommand(
        "/leak20"
    );
}


async function setLeak30() {

    await sendCommand(
        "/leak30"
    );
}


async function setLeak50() {

    await sendCommand(
        "/leak50"
    );
}


/* =======================================================
   AUTOMATIC LIVE UPDATE
======================================================= */

/*
   Update dashboard once immediately.
*/

updateDashboard();

checkConnection();


/*
   Continue updating every second.
*/

setInterval(
    updateDashboard,
    1000
);


/*
   Check connection every 5 seconds.
*/

setInterval(
    checkConnection,
    5000
);

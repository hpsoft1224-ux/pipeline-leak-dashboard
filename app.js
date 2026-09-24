const API_URL =
    "https://pipeline-leak-detection-mi59.onrender.com/predict";

const API_HOME =
    "https://pipeline-leak-detection-mi59.onrender.com/";


/* -------------------------------------------------------
   CHECK API CONNECTION
------------------------------------------------------- */

async function checkAPIConnection() {

    const dot = document.getElementById("connectionDot");
    const text = document.getElementById("connectionText");

    try {

        const response = await fetch(API_HOME);

        if (!response.ok) {
            throw new Error("API unavailable");
        }

        dot.classList.add("online");
        text.textContent = "ML API Online";

    } catch (error) {

        dot.classList.remove("online");
        text.textContent = "ML API Offline";
    }
}


/* -------------------------------------------------------
   RUN LEAK DETECTION
------------------------------------------------------- */

async function predictLeak() {

    const Qin = parseFloat(
        document.getElementById("qinInput").value
    );

    const Qout = parseFloat(
        document.getElementById("qoutInput").value
    );

    const DeltaP = parseFloat(
        document.getElementById("dpInput").value
    );


    /* Validate input */

    if (
        Number.isNaN(Qin) ||
        Number.isNaN(Qout) ||
        Number.isNaN(DeltaP)
    ) {

        alert("Please enter valid sensor values.");
        return;
    }


    /* Show processing state */

    const predictionElement =
        document.getElementById("prediction");

    predictionElement.textContent = "ANALYZING...";


    try {

        const response = await fetch(
            API_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    qin_lph: Qin,

                    qout_lph: Qout,

                    delta_p_bar: DeltaP

                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error || "Prediction failed"
            );
        }


        /* ------------------------------------------------
           UPDATE SENSOR VALUES
        ------------------------------------------------ */

        document.getElementById("qin").textContent =
            data.qin_lph.toFixed(2) + " LPH";


        document.getElementById("qout").textContent =
            data.qout_lph.toFixed(2) + " LPH";


        document.getElementById("dp").textContent =
            data.delta_p_bar.toFixed(5) + " bar";


        document.getElementById("deficit").textContent =
            data.flow_deficit_lph.toFixed(2) + " LPH";


        /* ------------------------------------------------
           UPDATE ML RESULT
        ------------------------------------------------ */

        predictionElement.textContent =
            data.prediction;


        document.getElementById("probability").textContent =
            (data.leak_probability * 100).toFixed(2) + "%";


        /* ------------------------------------------------
           CHANGE STATUS STYLE
        ------------------------------------------------ */

        const statusCard =
            document.querySelector(".status-card");


        statusCard.classList.remove(
            "leak",
            "normal"
        );


        if (data.prediction === "LEAK") {

            statusCard.classList.add("leak");

        } else {

            statusCard.classList.add("normal");
        }


    } catch (error) {

        console.error(error);

        predictionElement.textContent =
            "ERROR";

        document.getElementById("probability").textContent =
            "--";

        alert(
            "Unable to connect to the ML API.\n\n" +
            error.message
        );
    }
}


/* -------------------------------------------------------
   STARTUP
------------------------------------------------------- */

checkAPIConnection();

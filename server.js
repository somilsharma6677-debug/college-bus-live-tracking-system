const express = require("express");
const http = require("http");
const crypto = require("crypto");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

app.use(express.json({ limit: "10kb" }));
app.use(express.static("public"));


// ===============================
// DRIVERS
// ===============================

const drivers = [
    {
        username: "driver1",
        password: "pass123",
        busNumber: "BUS-01"
    },
    {
        username: "driver2",
        password: "pass123",
        busNumber: "BUS-02"
    },
    {
        username: "driver3",
        password: "pass123",
        busNumber: "BUS-03"
    }
];


// ===============================
// LOGIN SESSIONS
// ===============================

const sessions = new Map();


// ===============================
// ACTIVE BUS LOCATIONS
// ===============================

const activeLocations = {};


// ===============================
// LOGIN
// ===============================

app.post("/login", (req, res) => {

    const { username, password } = req.body || {};

    if (
        typeof username !== "string" ||
        typeof password !== "string" ||
        username.length > 100 ||
        password.length > 200
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid login details"
        });
    }

    const driver = drivers.find(
        (d) =>
            d.username === username &&
            d.password === password
    );

    if (!driver) {

        return res.json({
            success: false,
            message: "Invalid username or password"
        });

    }


    // Unique login token
    const token = crypto.randomUUID();


    sessions.set(token, {
        username: driver.username,
        busNumber: driver.busNumber
    });


    res.json({
        success: true,
        token: token,
        busNumber: driver.busNumber
    });

});


// ===============================
// VERIFY LOGIN
// ===============================

app.get("/verify", (req, res) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {

        return res.status(401).json({
            success: false
        });

    }


    if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false });
    }

    const token = authHeader.slice(7).trim();
    const session = sessions.get(token);


    if (!session) {

        return res.status(401).json({
            success: false
        });

    }


    res.json({
        success: true,
        username: session.username,
        busNumber: session.busNumber
    });

});


// ===============================
// SOCKET.IO
// ===============================

io.on("connection", (socket) => {

    console.log(
        "Naya connection aaya:",
        socket.id
    );


    // Driver authentication
    const token = socket.handshake.auth?.token;

    if (token) {

        const session = sessions.get(token);

        if (!session) {

            console.log(
                "Invalid driver connection:",
                socket.id
            );

            socket.disconnect(true);

            return;
        }


        // Server khud decide karega driver ki bus
        socket.driverBus = session.busNumber;

        console.log(
            session.username,
            "connected for",
            session.busNumber
        );

    }


    // New connection ko currently live buses bhejna
    Object.values(activeLocations).forEach((location) => {

        socket.emit(
            "receive-location",
            location
        );

    });


    // ===============================
    // LOCATION
    // ===============================

    socket.on("send-location", (data) => {

        // Sirf authenticated driver location bhej sakta hai
        if (!socket.driverBus) {

            console.log(
                "Unauthorized location attempt:",
                socket.id
            );

            return;
        }


        if (!data || typeof data !== "object") {
            return;
        }

        const lat = Number(data.lat);
        const lng = Number(data.lng);

        // Reject missing, non-finite, or out-of-range GPS coordinates.
        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat < -90 || lat > 90 ||
            lng < -180 || lng > 180
        ) {
            socket.emit("location-error", {
                message: "Invalid GPS coordinates received"
            });
            return;
        }

        const busNumber = socket.driverBus;

        const location = {
            id: socket.id,
            busNumber,
            lat,
            lng,
            updatedAt: Date.now()
        };

        activeLocations[busNumber] = location;


        io.emit(
            "receive-location",
            location
        );

    });


    // ===============================
    // STOP SHARING
    // ===============================

    socket.on("stop-sharing", () => {

        if (!socket.driverBus) {
            return;
        }


        const busNumber = socket.driverBus;


        if (
            activeLocations[busNumber] &&
            activeLocations[busNumber].id === socket.id
        ) {

            delete activeLocations[busNumber];

            io.emit(
                "bus-offline",
                busNumber
            );

        }

    });


    // ===============================
    // DISCONNECT
    // ===============================

    socket.on("disconnect", () => {

        console.log(
            "Connection band ho gaya:",
            socket.id
        );


        if (!socket.driverBus) {
            return;
        }


        const busNumber = socket.driverBus;


        if (
            activeLocations[busNumber] &&
            activeLocations[busNumber].id === socket.id
        ) {

            delete activeLocations[busNumber];

            io.emit(
                "bus-offline",
                busNumber
            );

        }

    });

});


// ===============================
// START SERVER
// ===============================

server.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});
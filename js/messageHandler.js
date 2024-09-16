
let MessageReceiver = (() => {

    let subscribe = (client) => {
        let userId = '*'; // Default value
        
        client.subscribe(`/exchange/Reload_Callback/reloadcallback.all`, (message) => {
            addDataToTable(JSON.parse(message.body))
        },{ ack: 'client-individual' });
    };
    

    return {
        subscribe,
    };
})();

let MessageClient = (() => {
    let websocketUrl;
    // Determine the WebSocket URL based on the current hostname
    let hostname = window.location.hostname;
    if (hostname !== 'crm-lpbank-uat.dxws.io' && hostname !== '127.0.0.1') {
        websocketUrl = 'wss://uat-crmcskh.lpbank.com.vn:8050/ntf/ws';
    } else {
        websocketUrl = 'wss://crm-lpbank-uat.dxws.io/ntf/ws';
    }

    let client = Stomp.client(websocketUrl);
    client.heartbeat.outgoing = 10000;
    client.heartbeat.incoming = 0;
    let headers = {
        login: "admin",  // Correct header key  
        passcode: "Lvpb@1234",  // Correct header key
    };
    client.reconnect_delay = 1000;
    client.debug = (e) => {};

    let isReconnecting = false;

    let init = () => {
        client.connect(headers, (frame) => {
            console.log('Connected: ' + frame);
            isReconnecting = false;
            MessageReceiver.subscribe(client);
        }, (error) => {
            console.log('Connection error: ' + error);
            // scheduleReconnect();
        });
    };

    let scheduleReconnect = () => {
        if (isReconnecting) return;
        isReconnecting = true;
        console.log('Scheduling reconnect...');
        setTimeout(() => {
            console.log('Reconnecting...');
            init();
        }, client.reconnect_delay);
    };

    let send = (topic, message) => client.send(topic, {}, message);

    // Handle disconnection event
    client.onclose = () => {
        console.log('Connection lost. Scheduling immediate reconnect...');
        // scheduleReconnect(true);
    };

    return {
        init,
        send,
        getClient: () => client
    };
})();

// Initialize the connection
MessageClient.init();

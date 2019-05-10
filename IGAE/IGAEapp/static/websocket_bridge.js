document.addEventListener('DOMContentLoaded', function() {
    let apps = [];
    try {
        let x = document.getElementsByClassName("list-group");
        let applications = x[0]["children"]
        //console.log(applications);

        for(let i=0; i < applications.length; i++){
            apps.push(applications[i]["childNodes"][0]["data"]);
        }
        
        console.log(apps);

        const Websocket = new WebSocket('ws://' + window.location.host + '/ws/apps/loading');
        Websocket.onopen = function open() {
            console.log('WebSocket connection created.');
        }
        Websocket.onmessage = function(e) {
            //console.log(e.data);
            let msg = e.data.split(":");
            let working = (msg[1] === 'true');
            if(!working){
                if(applications[msg[0]]["childNodes"][1] != undefined){
                    applications[msg[0]]["childNodes"][1].remove();
                }
            }
        }
        Websocket.onclose = function(e) {
            console.error("WebSocket closed unexpectedly");
        }  

        document.ws = Websocket;

    } catch (error) {
        console.error(error);
    }

    window.setInterval(function () {
        for(let i=0; i<apps.length;i++){
            document.ws.send(apps[i] + ":" + i);
        }
    }, 2000);

});

// $(()=>{ //ESTO ES MIERDA, UTILIZAR UNA COOKIE
//     console.log("cargado!");
//     let rawFile = new XMLHttpRequest();
//     var apps, json;
//     rawFile.open("GET", "/static/lastapps.txt");
//     rawFile.onreadystatechange = function (){
//         if(rawFile.readyState === 4){
//             if(rawFile.status === 200 || rawFile.status === 0){
//                 apps = rawFile.responseText;
//                 json = JSON.parse(apps) 
//                 console.log(json);
//                 for(let i = 1; i <= 4; i++){
//                     let app;
//                     app = json[i]
//                     if (app !== undefined){
//                         let name = $("#navbarDropdown");
//                         console.log(name[0].innerText);
//                         $("#last-apps").append("<a class='app' href='/sgrw/"+name[0].innerText.replace(/ /g, '')+"/"+app+"'><p>"+app+"</p></a>");
//                     }
                    
//                 }
//             }
//         }
//     }
//     rawFile.send(null);
// });
document.addEventListener('DOMContentLoaded', function() {
    var inc = 60; //segundos de precision, puede cambiarse si se quiere mas precision
   // var Vusers = [];
   // var Transactions = [];
    //var txs_avg_time = [];
  //  var TransactionsType = [];
    var dataUnified = [];
    var ops = [];
    var escenarios_name = [];
    var escenarios_vusers = [];
    var txs_data_chart = {};
    var txs_data_scenarios = {};
    //var vuser_colors = ['#f7fbff','#deebf7','#c6dbef','#9ecae1','#6baed6','#4292c6','#2171b5','#08519c','#08306b'];
    // var vuser_colors = ['#08306b','#08519c','#2171b5','#4292c6','#6baed6','#9ecae1','#c6dbef','#deebf7','#f7fbff'];
    // var vuser_colors = ['#0070AD','#1C2247','#162FE0','#B7672E','#E04D16','#19AAF9','#BA131D','#09BA99','#0AB3C4'];
    var primary_colors = ['#0070ad','#12abdb','#2b0a3d','#ff304c','#95e616']
    //var txs_colors = ['#fff7ec','#fee8c8','#fdd49e','#fdbb84','#fc8d59','#ef6548','#d7301f','#b30000','#7f0000'];
    // var txs_colors = ['#7f0000','#b30000','#d7301f','#ef6548','#fc8d59','#fdbb84','#fdd49e','#fee8c8','#fff7ec'];
    var corporate_colors = ['#80b8d6','#00c37b','#0f999c','#cb2980','#7e39ba','#88d5ed','#15596b','#ff6327','#860864','#4701a7','#c8ff16','#01d1d0','#ff7e83','#6d64cc'];
    //var colors = ['#0070ad', '#2b0a3d', '#ef304c', '#12b3db', '#95e510', '#ececec', '#ffffff'];
    var compositeBar = dc.compositeChart("#bar-chart");
    var compositeLine = dc.compositeChart("#chart");
    var pieChart  = dc.pieChart('#txs-pie-chart');
    // var rowChart = dc.rowChart('#txs-row-chart');
    var scenariosChart = dc.sunburstChart('#txs-row-chart');
    var avgChart = dc.barChart('#avg-tx-time-chart');
    var boxChart = dc.boxPlot('#charts-3')
    let first = true; 

    var find_query = function () {
        var _map = window.location.search.substr(1).split('&').map(function (a) {
            return a.split('=');
        }).reduce(function (p, v) {
            if (v.length > 1)
                p[v[0]] = decodeURIComponent(v[1].replace(/\+/g, " "));
            else
                p[v[0]] = true;
            return p;
        }, {});
        return function (field) {
            return _map[field] || null;
        };
    }();

    var resizeMode = find_query('resize') || 'widhei';

    /** Se podría pasar los graficos con un array para hacerlo más dinámico. */
    function apply_resizing(chartline, chartbar, adjustX, adjustY, onresize) {
        if (resizeMode.toLowerCase() === 'viewbox') {
            chartline
                .width(600)
                .height(400)
                .useViewBoxResizing(true);
            d3.select(chartline.anchor()).classed('fullsize', true);
            chartbar
                .width(600)
                .height(400)
                .useViewBoxResizing(true);
            d3.select(chartbar.anchor()).classed('fullsize', true);
        } else {
            adjustX = adjustX || 0;
            adjustY = adjustY || adjustX || 0;
            chartline
                //.width(elm.offsetWidth - adjustX)
                .width(window.innerWidth / adjustX)
                .height(window.innerHeight / adjustY);
            chartbar
                .width(window.innerWidth / adjustX)
                .height(window.innerHeight / adjustY);

            window.onresize = function () {
                if (onresize) {
                    onresize(chartline);
                    onresize(chartbar);
                }
                chartline
                    .width(window.innerWidth / adjustX)
                    .height(window.innerHeight / adjustY);
                
                chartbar
                    .width(window.innerWidth / adjustX)
                    .height(window.innerHeight / adjustY);
    
                if (chartline.rescale) {
                    chartline.rescale();
                }
                if (chartbar.rescale) {
                    chartbar.rescale();
                }
                chartline.redraw();
                chartbar.redraw();
            };
        }
    }

    function clearArray(array){
        for(let i=array.length; i>0; i--){
            array.pop();
        }
    }

    function addData(data){
        let base = undefined;
        txs_data_chart = {};
        txs_data_scenarios = {};
        for (let scen in data){
            // num_scen += 1;
            let exctp = false;
            let current_scenario = "";
            let scenario = data[scen];
            if(scen.indexOf(".") > -1){
                current_scenario = scen.split(".")[0];       
            }else{
                current_scenario = scen;
            }

            if(!escenarios_vusers.includes(current_scenario)){
                escenarios_vusers.push(current_scenario);
                exctp = true;
            }

            if(!escenarios_name.includes(current_scenario)){
                escenarios_name.push(current_scenario);
            }

            if(!ops.includes(scen)){
                ops.push(scen);
            }
            let users = scenario["Vusers"];
            let trans = scenario["Transactions"];
            let txs_type = scenario["txs_type"];
            let total = 0;
            let dato = {}
            //dato['Timestamp'] = users[0].Timestamp - 10;
            if(base === undefined){
                base = users[0].Timestamp - 10;
            }
            dato['Timestamp'] = base;
            dato['total'] = total;
            dato['scenario'] = current_scenario;
            dato['op'] = "vusers";
            // dato['op'] = current_scenario + ".vuser";
            dato['type'] = "vuser";
            dataUnified.push(dato)
            //Vusers.push(dato);
            let count = 0, ct = 0;
            let time = parseInt(users[0].Timestamp, 10);
            let i = 0;
            while(users[count] !== undefined){
                while(users[count] !== undefined && time >= users[count].Timestamp){
                    // if(users[count].Type === "Run"){
                    //     total++;
                    // }else if(users[count].Type === "End"){
                    //     total--;
                    // }
                    count++;    
                }
                if(exctp){
                    dato = {}
                    dato['Timestamp'] = base + i;
                    // console.log(count);
                    // console.log(users);
                    // console.log(users[count]);
                    dato['total'] = users[count-1].Count;
                    dato['scenario'] = current_scenario;
                    dato['op'] = "vusers";
                    //dato['op'] = current_scenario + ".vuser";
                    dato['type'] = "vuser";
                    dataUnified.push(dato)
                    //Vusers.push(dato);
                }
                let num = 0;
                /* Contamos el numero de transacciones para el tiempo que ha pasado */
                let temp = {};
                while(trans[ct] !== undefined && time >= trans[ct].StartTime && time >= trans[ct].EndTime){
                    if(temp[trans[ct].Name] === undefined){
                        let data = {};
                        data["avg_time"] = parseFloat(trans[ct].AverageTime);
                        data["num"] = 1;
                        data["Timestamp"] = base + i;
                        data['scenario'] = current_scenario;
                        data["op"] = scen;
                        data["tx_name"] = trans[ct].Name;
                        data["type"] = "transactionLine";
                        temp[trans[ct].Name] = data;
                    }else{
                        let data = temp[trans[ct].Name];
                        let time = parseFloat(data["avg_time"]) * parseInt(data["num"]);
                        time += parseFloat(trans[ct].AverageTime);
                        data["num"] += 1;
                        data["avg_time"] = time / parseInt(data["num"]);
                        data["Timestamp"] = base + i;
                        data['scenario'] = current_scenario;
                        data["op"] = scen;
                        data["tx_name"] = trans[ct].Name;
                        data["type"] = "transactionLine";
                        temp[trans[ct].Name] = data;
                    }
                    ct++;
                    num++;
                }
                //console.log(temp);
                let tr = {};
                tr['Timestamp'] = base + i;
                tr['count'] = num;
                tr['op'] = scen;
                tr['scenario'] = current_scenario;
                tr["type"] = "transactionBar";
                //console.log(temp);
                for(let tx in txs_type){
                    if(temp[txs_type[tx]] !== undefined){
                        dataUnified.push(temp[txs_type[tx]]);
                        //TransactionsType.push(temp[txs_type[tx]]);
                    }else{
                        dataUnified.push({"avg_time": 0, "num": 0, "Timestamp": base+i, "op": scen, "tx_name": txs_type[tx], "scenario": current_scenario, "type": "transactionLine"});
                        // TransactionsType.push({"avg_time": 0, "num": 0, "Timestamp": base+i, "op": scen, "tx_name": txs_type[tx], "type": "transactionLine"});
                    }
                }
                dataUnified.push(tr);
                // Transactions.push(tr);

                for(let tx in temp){
                    let nombre = current_scenario + "." + temp[tx].tx_name;
                    if(!(current_scenario in txs_data_scenarios)){
                        txs_data_scenarios[current_scenario] = [];
                    }
                    if(nombre in txs_data_chart){
                        let temporal = txs_data_chart[nombre];
                        let primero = parseFloat(temporal["avg_time"]) * parseInt(temporal["num"]);
                        let segundo = parseFloat(temp[tx]["avg_time"]) * parseInt(temp[tx]["num"]);
                        let numTotal = parseInt(temporal["num"]) + parseInt(temp[tx]["num"]);
                        let total = (primero + segundo) / numTotal;
                        temporal["avg_time"] = total;
                        temporal["num"] = numTotal;
                        txs_data_chart[nombre] = temporal;
                        txs_data_scenarios[current_scenario].push(temporal)
                    }
                    else{
                        txs_data_scenarios[current_scenario].push(temp[tx]);
                        txs_data_chart[nombre] = temp[tx];
                    }
                }
                time = time + inc;
                i += inc;
            }
        }     
    }

    function reqListener(){
        // if(first)document.getElementsByClassName("loader")[0].remove();
        if(first)document.getElementById("gif").remove();
        //else{ clearArray(Vusers); clearArray(Transactions); clearArray(TransactionsType); clearArray(ops); clearArray(escenarios_name); clearArray(escenarios_vusers);}
        // else{ clearArray(dataUnified); clearArray(ops); clearArray(escenarios_name); clearArray(escenarios_vusers);}
        // num_scen = 0; 
        // let txs_avg_time = {}; let txs_map = {};
        // console.log(JSON.parse(this.responseText));
        // addData(JSON.parse(this.responseText));
        let response = JSON.parse(this.responseText);
        let transactions = response["transactions"];
        let scenarios = response["scenarios"];
        let transactionsName = response["transactionsName"];
        let averages = response["averages"];
        transactions.forEach(function(d){
            d.timestamp = new Date(parseInt(d.timestamp, 10));
        });
        var ndx             = crossfilter(transactions),
            // all             = ndx.groupAll(),
            chartsDimension = ndx.dimension(function(d){return d.timestamp;}),
            pieDimension    = ndx.dimension(function(d){return d.scenario;}),
            avgDimension    = ndx.dimension(function(d){if(d.type === "transaction"){return d.scenario + " - " + d.transaction;}else{return d.scenario + " - users";}}),
            sDimension      = ndx.dimension(function(d){if(d.type === "transaction"){return [d.scenario, d.label];}else{return [d.scenario, "users"];}});
            // rowDimension    = ndx.dimension(function(d){return d.type ;});
        
        pieChart
            .width(250)
            .height(250)
            .radius(120)
            .innerRadius(40)
            .dimension(pieDimension)
            .group(pieDimension.group())
            .ordinalColors(primary_colors);

        scenariosChart
            .width(250)
            .height(250)
            .dimension(sDimension)
            .group(sDimension.group())
            .colors(d3.scaleOrdinal(corporate_colors));

        avgChart
            .width(600)
            .height(450)
            .margins({top: 45, right: 50, bottom: 85, left: 50})
            // .xAxisLabel("Transactions")
            .yAxisLabel('Total Time (sec)')
            .elasticY(true)
            .x(d3.scaleBand())
            .xUnits(dc.units.ordinal)
            .elasticX(true)
            .brushOn(false)
            .dimension(avgDimension)
            .title(function(d){return d.key + ":" + d.value;})
            .group(avgDimension.group().reduceSum(function(d){
                if(d.type === "transaction"){
                    return d.avg_time / averages[d.transaction];
                }else{
                    return 0;
                }
            }))
            .colors('#80b8d6')
            .renderLabel(true);
        // rowChart
        //     .width(250)
        //     .height(250)
        //     .dimension(rowDimension)
        //     .group(rowDimension.group())
        //     .colors('#12abdb')
        //     .renderLabel(true)
        //     .elasticX(true)
        //     .xAxis().ticks(4);
        
        var minDate = chartsDimension.bottom(1)[0].timestamp;
        var maxDate = chartsDimension.top(1)[0].timestamp.getTime() + 1*60000;
        var maxDateLine = chartsDimension.top(1)[0].timestamp;

        var charts = [], bars = [], colors = 0;
        scenarios.forEach(function(scenario){
            let usersGroup = chartsDimension.group().reduceSum(function(d){if(d.type === "users" && d.scenario === scenario){return d.num_users;}else{return 0;}});
            charts.push(
                dc.lineChart(compositeLine)
                .elasticY(true)
                .brushOn(false)
                .group(usersGroup)
                .colors(corporate_colors[colors])
                .renderArea(true)
                .useRightYAxis(true)
                //.legend(dc.htmlLegend().container('#txs-row-chart').horizontal(false).highlightSelected(true))
            );
            colors++;
        });

        let color = 0;
        transactionsName.forEach(function(transaction){
            let chartsGroup, barsGroup; 
            let data = transaction.split("$");
            if (data[1] === "Select-all"){
                chartsGroup = chartsDimension.group().reduceSum(function(d){if(d.type === "transaction" && d.scenario === data[0]){return d.avg_time;}else{return 0;}});
                barsGroup   = chartsDimension.group().reduceSum(function(d){if(d.type === "transaction" && d.scenario === data[0]){return d.txs_count;}else{return 0;}});
            }else{
                chartsGroup = chartsDimension.group().reduceSum(function(d){if(d.type === "transaction" && d.scenario === data[0] && d.label === data[1]){return d.avg_time;}else{return 0;}});
                barsGroup   = chartsDimension.group().reduceSum(function(d){if(d.type === "transaction" && d.scenario === data[0] && d.label === data[1]){return d.txs_count;}else{return 0;}});
            }
            charts.push(
                dc.lineChart(compositeLine)
                .elasticY(true)
                .curve(d3.curveCatmullRom.alpha(0.5))
                .brushOn(false)
                .group(chartsGroup)
                .colors(corporate_colors[color])
            );
            bars.push(
                dc.barChart(compositeBar)
                .elasticY(true)
                .gap(2)
                .group(barsGroup)
                .colors(corporate_colors[color])
            );
            color++
        });

        var adjustX = 1.6, adjustY = 2.35;

        compositeBar
            .transitionDuration(1000)
            .elasticY(true)
            .width(window.innerWidth/adjustX)
            .height(window.innerHeight/adjustY)
            .margins({top: 45, right: 65, bottom: 45, left: 65})
            .x(d3.scaleTime().domain([minDate,maxDate]))
            .xUnits(d3.timeMinutes)
            .renderHorizontalGridLines(true)
            .dimension(chartsDimension)
            .compose(bars)
            .yAxisLabel("Nº Transactions per time")
            .xAxisLabel("Execution time")
            .xAxis().tickFormat(d3.timeFormat("%H:%M:%S"));

        compositeLine
            .transitionDuration(1000)
            .elasticY(true)       
            .width(window.innerWidth-adjustX)
            .height(window.innerHeight-adjustY)
            .margins({top: 45, right: 65, bottom: 45, left: 65})
            .x(d3.scaleTime().domain([minDate,maxDateLine]))
            .xUnits(d3.timeMinutes)
            .renderHorizontalGridLines(true)
            .brushOn(false)
            .mouseZoomable(true)
            .dimension(chartsDimension)
            .rangeChart(compositeBar)
            .title(function(d){return d.value;})
            .compose(charts)
            .yAxisLabel("elapsed time per transaction (ms)")
            .rightYAxisLabel("Active users")
            .xAxis().tickFormat(d3.timeFormat("%H:%M:%S"));

        
        apply_resizing(compositeLine, compositeBar, adjustX, adjustY);
        pieChart.render();
        scenariosChart.render();
        // rowChart.render();
        compositeLine.render();
        compositeBar.render();
        avgChart.render();
        // dc.renderAll();
        //var parseDate = d3.utcParse("%H:%M:%S"); //var parseDate = d3.utcParse("%H:%M:%S");
        /*Habría que aprovechar el bucle en el que se crean los datos...*/ // <--- PARA MEJORAR RENDIMIENTO
        // dataUnified.forEach(function(d) {
        //     let mul;
        //     if(d.Timestamp.toString().length < 11){
        //         mul = d.Timestamp * 1000;
        //     }else{
        //         mul = d.Timestamp;
        //     }
        //     let date = new Date(mul);
        //     d.Timestamp = date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds();
        //     //d.Timestamp = date.getUTCMinutes() + ":" + date.getUTCSeconds(); 
        //     d.Timestamp = parseDate(d.Timestamp);
        // });
        // let new_chart_data = []; let labels = [];
        // for(let tx in txs_data_chart){
        //     new_chart_data.push(txs_data_chart[tx]);
        //     labels.push(tx);
        // }
        // Transactions.forEach(function(d){
        //     date = new Date(d.Timestamp * 1000);
        //     d.Timestamp = date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds(); 
        //     d.Timestamp = parseDate(d.Timestamp);
        // });
        // TransactionsType.forEach(function(d){
        //     date = new Date(d.Timestamp * 1000);
        //     d.Timestamp = date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds(); 
        //     //d.Timestamp = date.getUTCMinutes() + ":" + date.getUTCSeconds();
        //     d.Timestamp = parseDate(d.Timestamp);
        // });
        //console.log(Vusers);
        //console.log(Transactions);
        // console.log(dataUnified);
        //console.log(txs_avg_time);
		// console.log(dataUnified);
        // var ndx = crossfilter(dataUnified);
        // var tdx = crossfilter(new_chart_data);
        // var all = tdx.groupAll();
        //console.log(dataUnified);
        //var txs = crossfilter(Transactions);
        //console.log(TransactionsType);
        //var ttype = crossfilter(TransactionsType);
        /*var arrayfilters = {};
        var arrayDim = {};
        //console.log(txs_map);
        for (tx in txs_map){
            arrayfilters[tx+"."+txs_map[tx][0].scenario] = crossfilter(txs_map[tx]);
            arrayDim[tx+"."+txs_map[tx][0].scenario] = arrayfilters[tx+"."+txs_map[tx][0].scenario].dimension(function(d){return d.Timestamp;});
        }*/
        //console.log(arrayDim);
        /*for (tx in txs_type){
            arrayfilters[txs_type[tx]] = crossfilter(txs_map[txs_type[tx]]);
            arrayDim[txs_type[tx]] = arrayfilters[txs_type[tx]].dimesion(function(d){return d.Timestamp;});
        }
        console.log(arrayDim);*/
        //var prueba = crossfilter(txs_avg_time["T00_Login"]);
        //print_filter(txs);
        //print_filter(ndx);
    //     var dateDim = ndx.dimension(function(d) { return d.Timestamp; } );
    //     // var txsDim = ndx.dimension(function(d){  return d.Timestamp; });
    //     // var ttypeDim = ndx.dimension(function(d){  return d.Timestamp; });
    //     //var opsDim = ndx.dimension(function (d) {return d.op;});
    //     var opsDim = ndx.dimension(function (d) {return d.scenario;});
    //     var opsGroup = opsDim.group();
    //     var rowDim = ndx.dimension(function (d){return d.op;});
    //     var rowGroup = rowDim.group();//.reduceSum(function (d){if(d.op === "vusers"){return 0;} else {return 1;}})
    //     // var opsGroup = dateDim.group().reduceSum(function(d){ {return d.op;}});
    //     // var avgDim = ndx.dimension(function(d){if(d.op !== "vusers"){return d.tx_name;} else{return 0;}});
    //     // var avgGroup = avgDim.group();

    //     var avgDim = tdx.dimension(function (d){var nombre = (d.op.split(".")[0] + " - " + d.tx_name); return nombre;});
       

    //     pieChart.width(250)
    //         .height(250)
    //         //.margins({top: 20, left: 5, right: 10, bottom: 20})
            // .radius(120)
            // .innerRadius(40)
            // .dimension(opsDim)
            // .group(opsGroup)
            // .ordinalColors(vuser_colors)
    //         .label(function (d) {
    //             return d.key;
    //         })
    //         .title(function (d) {
    //             return "";
    //         })
    //         // .elasticX(true)
    //         // .xAxis().ticks(4);
    //     //var pruebaDim = prueba.dimension(function(d){ return d.Timestamp; });

        // rowChart.width(250)
        //     .height(250)
        //     .dimension(rowDim)
        //     .group(rowGroup)
        //     .ordinalColors(txs_colors)
        //     .renderLabel(true)
    //         .label(function (d) {
    //             var v = d.key.split(".")
    //             return v[0] + " - " + v[1];
    //         })
    //         .title(function (d) {
    //             var v = d.key.split(".")
    //             return v[0] + " - " + v[1];
    //         })
    //         .elasticX(true)
    //         .xAxis().ticks(4);
        
    //     let line_compose =[], bar_compose = [];
    //     if(ops.length > 1){
    //         // for(let i=0; i<escenarios_name.length; i++){
    //         //     var div = document.createElement('div');
    //         //     div.setAttribute('id', 'avg_chart_'+i);
    //         //     document.getElementById('charts-2').appendChild(div);

    //         // // var avgGroup = avgDim.group().reduceSum(function (d){return d.avg_time;});
    //         //     var avgDim = tdx.dimension(function (d){var nombre = (d.op.split(".")[0] + " - " + d.tx_name); if(d.scenario === escenarios_name[i]){return nombre;}else{return 0;}});
    //         //     var avgGroup = avgDim.group().reduceSum(function (d){if(d.scenario === escenarios_name[i]){return d.avg_time;}else{return 0;}});
    //         //     dc.barChart('#avg_chart_'+i).width(550)
    //         //         .height(400)
    //         //         .xAxisLabel("Transactions " + escenarios_name[i])
    //         //         .yAxisLabel('Time')
    //         //         .dimension(avgDim)
    //         //         .group(avgGroup)
    //         //         .x(d3.scaleBand())
    //         //         .xUnits(dc.units.ordinal)
    //         //         .colors(txs_colors)
    //         //         .renderLabel(true)
    //         //         .yAxis().ticks(5);


    //         // }
    //         var avgDim = tdx.dimension(function (d){var nombre = (d.op.split(".")[0] + " - " + d.tx_name); return nombre;});
    //         var avgGroup = avgDim.group().reduceSum(function (d){return d.avg_time;});
    //         avgChart.width(550)
    //             .height(400)
    //             .xAxisLabel("Transactions")
    //             .yAxisLabel('AvgTime/tx for scenario')
    //             .dimension(avgDim)
    //             .group(avgGroup)
    //             .x(d3.scaleBand())
    //             .xUnits(dc.units.ordinal)
    //             .colors(txs_colors)
    //             .renderLabel(true)
    //             .yAxis().ticks(5);

    //         for(let i=0; i<escenarios_vusers.length; i++){
    //             let hits_temp = dateDim.group().reduceSum(function(d){if(d.scenario===escenarios_vusers[i] && d.type === "vuser"){return d.total;}else{return 0;}});
                
    //             let linechart = dc.lineChart(compositeLine)
    //                 .group(hits_temp, "Users_"+ escenarios_vusers[i])
    //                 .colors(vuser_colors[i])
    //                 .renderArea(true)
    //                 .label(function (d) {
    //                     return d.key;
    //                 })
    //                 .brushOn(false)
    //                 .useRightYAxis(true);

    //             line_compose.push(linechart);
    //         }
    //         for(let i=0; i<ops.length;i++){
    //             let txs_temp = dateDim.group().reduceSum(function(d){if(d.op===ops[i] && d.type === "transactionBar"){return d.count;}else{return 0;}});
    //             var sumTime_temp = dateDim.group().reduceSum(function(d){if(d.op===ops[i] && d.type === "transactionLine"){return d.avg_time;}else{return 0;}});
    //             let barchart = dc.barChart(compositeBar)                     
    //                 .group(txs_temp, "Txs/time_" + ops[i])
    //                 .colors(txs_colors[i])
    //                 .centerBar(true)
    //                 .gap(2)
    //                 .brushOn(false);
                
    //             bar_compose.push(barchart);

    //             let anotherlinechart = dc.lineChart(compositeLine)
    //                 .group(sumTime_temp,"AvgTime/Tx_"+ ops[i])
    //                 .colors(txs_colors[i])
    //                 .renderArea(false)
    //                 .curve(d3.curveCatmullRom.alpha(0.5))
    //                 .label(function (d) {
    //                     return d.key;
    //                 })
    //                 .brushOn(false);

    //             line_compose.push(anotherlinechart);
    //         }
    //     }else{
    //         var hits = dateDim.group().reduceSum(function(d) {if(d.type === "vuser"){return d.total;}else{return 0;}});
    //         var numtxs = dateDim.group().reduceSum(function(d){if(d.type === "transactionBar"){return d.count;}else{return 0;}});
    //         //var prueba = ttypeDim.group().reduceSum(function(d){ if(d.avg_time !== 0){ return (d.avg_time / d.num_txs_scenario);}else{return d.avg_time;}});
    //         var sumTime = dateDim.group().reduceSum(function(d){if(d.type === "transactionLine"){return d.avg_time;}else{return 0;}});
    //         //var prueba2 = ttypeDim.group().reduceSum(function(d){if(d.tx_name === "T04_VolverInicio" && d.scenario === "scenario1"){return d.avg_time;}else{return 0;}});
    //         let barchart = dc.barChart(compositeBar)
    //                 .group(numtxs, "Txs/time_"+escenarios_vusers[0])
    //                 .colors(txs_colors[0])
    //                 .centerBar(true)
    //                 .gap(2)
    //                 .label(function (d) {
    //                     return d.key;
    //                 })
    //                 .title(function (d) {
    //                     return d.value;
    //                 })
    //                 .brushOn(false);
            
    //         let linechart = dc.lineChart(compositeLine)
    //                 .group(hits, "Vusers_"+escenarios_vusers[0])
    //                 .colors(vuser_colors[0])
    //                 .renderArea(true)
    //                 .label(function (d) {
    //                     return d.key;
    //                 })
    //                 .title(function (d) {
    //                     return d.value;
    //                 })
    //                 .brushOn(false)
    //                 .useRightYAxis(true);
            
            
    //         line_compose.push(linechart);
    //         bar_compose.push(barchart);

    //         // let anotherlinechart = dc.lineChart(compositeBar)
    //         //     .group(numtxs, "Txs/time_"+escenarios_vusers[0])
    //         //     .colors(colors[4])
    //         //     .renderArea(false)
    //         //     .curve(d3.curveCatmullRom.alpha(0.5))
    //         //     .brushOn(false);

    //         // bar_compose.push(anotherlinechart);
            
    //         linechart = dc.lineChart(compositeLine)
    //             .group(sumTime,"All Txs AvgTime (sec)")
    //             .colors(txs_colors[0])
    //             .renderArea(false)
    //             .curve(d3.curveCatmullRom.alpha(0.5))
    //             .label(function (d) {
    //                 return d.key;
    //             })
    //             .title(function (d) {
    //                 return d.key;
    //             })
    //             .brushOn(false);
    //         line_compose.push(linechart);

    //         var avgDim = tdx.dimension(function (d){var nombre = (d.op.split(".")[0] + " - " + d.tx_name); return nombre;});
    //         var avgGroup = avgDim.group().reduceSum(function (d){return d.avg_time;});

    //         avgChart.width(550)
    //             .height(400)
    //             .xAxisLabel("Transactions")
    //             .yAxisLabel('AvgTime/tx for scenario')
    //             .dimension(avgDim)
    //             .group(avgGroup)
    //             .x(d3.scaleBand())
    //             .xUnits(dc.units.ordinal)
    //             .colors(txs_colors)
    //             .renderLabel(true)
    //             .yAxis().ticks(5);

    //     }

    //     var minDate = dateDim.bottom(1)[0].Timestamp;
    //     var maxDate = dateDim.top(1)[0].Timestamp;

    //     compositeLine.resetSvg();
    //     compositeBar.resetSvg();
            
    //     var adjustX = 1.6, adjustY = 3.2;
    //     //2var adjXlegend = 1000;
    //     //var adjustX = 800, adjustY = 490;
    //     console.log(window.innerWidth);
    //     console.log(window.innerHeight);

    //     compositeBar.width(window.innerWidth/adjustX).height((window.innerHeight/adjustY))
    //         .transitionDuration(1000)
    //         .x(d3.scaleTime().domain([minDate,maxDate]))
    //         //.legend(dc.legend().x(50).y(10).itemHeight(7).gap(3))
    //         .xUnits(d3.timeMinutes)
    //         .round(d3.timeMinute.round)
    //         .renderTitle(true)
    //         .elasticY(true)
    //         .renderHorizontalGridLines(true)
    //         .dimension(dateDim)
    //         .compose(bar_compose)
    //         .yAxisLabel("Txs per time")
    //         .xAxis().tickFormat(d3.timeFormat("%H:%M:%S")); 
       
    //    compositeLine.width(window.innerWidth-adjustX).height(window.innerHeight-adjustY)
    //         .transitionDuration(1000)
    //         .x(d3.scaleTime().domain([minDate,maxDate]))
    //         //.legend(dc.legend().x(50).y(10).itemHeight(7).gap(3))
    //         .xUnits(d3.timeMinutes)
    //         .elasticY(true)
    //         .renderHorizontalGridLines(true)
    //         .dimension(dateDim)
    //         .mouseZoomable(true)
    //         .rangeChart(compositeBar)
    //         .compose(line_compose)
    //         .yAxisLabel("Avg time for tx")
    //         .rightYAxisLabel("Users count")
    //         .brushOn(false)
    //         .xAxis().tickFormat(d3.timeFormat("%H:%M:%S"));
        
        
    //     apply_resizing(rowChart, compositeLine, compositeBar, adjustX, adjustY);
        //dc.renderAll();

    //     base = undefined;
        if(!first){
            //dc.renderAll();
            //dc.redrawAll();
            let btn = document.getElementById("selectScenarios");
            btn.disabled = false;
            btn.classList.remove("running");
        }

    }

    function robotListener(){
        document.getElementById("wheel").remove();

        let response = JSON.parse(this.responseText);
        let data = response["data"];

        data.forEach(function(d){
            d.timestamp = new Date(parseInt(d.timestamp, 10));
        });
        // console.log(data);
        let ndx             = crossfilter(data);
        let bpGenderDim     = ndx.dimension(function (d) {return d.timestamp;});
        let bpGenderGroup   = bpGenderDim.group().reduce(
            function (p, v) {
                // Retrieve the data value, if not Infinity or null add it.
                let dv = v.avg;
                if (dv != Infinity && dv != null) p.splice(d3.bisectLeft(p, dv), 0, dv);
                return p;
            },
            function (p, v) {
                // Retrieve the data value, if not Infinity or null remove it.
                let dv = v.avg;
                if (dv != Infinity && dv != null) p.splice(d3.bisectLeft(p, dv), 1);
                return p;
            },
            function () {
                return [];
            }
        );

        boxChart
            .width(1200)
            .height(550)
            .dimension(bpGenderDim)
            .group(bpGenderGroup)
            // .tickFormat(d3.format('.1f'))
            .renderDataPoints(true)
            .renderTitle(true)
            .margins({top: 10, right: 50, bottom: 40, left: 50})
            .dataOpacity(1)
            .dataWidthPortion(0.9)
            .yAxisLabel("Avg (ms)")
            .xAxisLabel("Timestamp", 0)
            .elasticY(true)
            .elasticX(true)
            .xAxis().tickFormat(d3.timeFormat("%H:%M:%S"));

        boxChart.render();
    }

    let app = document.getElementsByClassName("display-4")[0]["childNodes"][0]["data"];
    let escenarios = document.getElementsByClassName("mb-0");
    let lastEscenario = escenarios[escenarios.length - 1]["childNodes"][1]["innerText"].replace(/ /g,'');
    var request = new XMLHttpRequest();
    var robot_chart_req = new XMLHttpRequest();
    request.addEventListener("load", reqListener);
    robot_chart_req.addEventListener("load", robotListener);
    request.open("GET", `http://${window.location.host}/sgrw/api/scenario/search?app=${app}&keys=${lastEscenario}$Select-all`);
    robot_chart_req.open("GET", `http://${window.location.host}/sgrw/api/robot_scenario/show?app=${app}`);
    request.send();
    robot_chart_req.send();

    function getCSRFToken() {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                if (cookie.substring(0, 10) == ('csrftoken' + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function getSelectedValues(){
        let txs = document.getElementsByClassName("custom-control-input");
        let app = document.getElementsByClassName("display-4")[0]["childNodes"][0]["data"];
        // let token = getCSRFToken();
        first = false;
        // var fd = new FormData();
        let j = false;
        var scenarios = "";
        let sa = [];
        for(let i=0; i<txs.length; i++){
            if(txs[i].checked){
                if(txs[i].id.split("$")[1] === "Select-all"){
                    sa.push(txs[i].id.split("$")[0]);
                    if(j){
                        scenarios += ","
                    }else{
                        j = true;
                    }
                    scenarios += txs[i].id;
                }
                if(!sa.includes(txs[i].id.split("$")[0])){
                    if(j){
                        scenarios += ","
                    }else{
                        j = true;
                    }
                    scenarios += txs[i].id;
                }
            }
        }
        if(j){
            let btn = document.getElementById("selectScenarios");
            btn.disabled = true;
            btn.classList.add("running");
            // console.log(scenarios);
            var request = new XMLHttpRequest();
            request.addEventListener("load", reqListener);
            request.open("GET", `http://${window.location.host}/sgrw/api/scenario/search?app=${app}&keys=${scenarios}`);
            request.send();
            // var xhr = new XMLHttpRequest();
            // xhr.addEventListener("load", reqListener);
            // xhr.open('POST', `http://localhost:8000/sgrw/api/${app}/scenario/all`, true);
            
            // //xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            // xhr.setRequestHeader("X-CSRFToken", token); 
            // fd.append("scenarios", scens);
            // // fd.forEach(d => {
            // //     console.log(d);
            // // });
            // xhr.send(fd);
        }
        else{
            alert("You must select a scenario");
        }
    }

    document.compositeBar = compositeBar;
    document.compositeLine = compositeLine;
    document.scenariosChart = scenariosChart;
    document.avgChart = avgChart;
    document.piechart = pieChart;
    document.getSelectedValues = getSelectedValues;
});
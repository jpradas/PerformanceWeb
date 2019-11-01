from ..models import Transaction, App, Scenario
from .resources.background import DjangoBackground
from .utils import file_loader
from django.http import HttpResponse, Http404, HttpResponseForbidden, JsonResponse
from django.template import loader
from django.shortcuts import get_object_or_404, render, redirect
import datetime
import time
import json
import csv

def insert_data(scenario, json01, json02):
    try:
        line_count = 0
        labels = {}
        base_time = int(734184000000)
        last = 0
        acum = 0
        for row in json01:
            try:
                data = row["Transaction"]
                if data["Type"] == '1':
                    date_row = datetime.datetime.fromtimestamp(float(data['StartTime'].replace(",",".")))
                    date_row = date_row - datetime.timedelta(minutes=date_row.minute % 1, seconds=date_row.second)
                    timestamp = int(datetime.datetime.timestamp(date_row)) * 1000
                    if last == 0:
                        last = timestamp
                        op = "none"
                    if timestamp != last:
                        if timestamp > last:
                            op = "sum"
                            diff = timestamp - last
                        else:
                            op = "sub"
                            diff = last - timestamp
                        last = timestamp
                    if op == "sum":
                        acum += diff
                    elif op == "sub":
                        acum -= diff
                    timestamp = base_time + acum
                    op = "none"
                    if data["Name"] not in labels:
                        minute_time =  {"avg_time": str(float(data['EndTime'].replace(",",".")) - float(data['StartTime'].replace(",","."))), "count": "1", "type": "transaction"}
                        labels[data["Name"]] = {timestamp: minute_time}
                    else:
                        try:
                            ts = labels[data["Name"]][timestamp]
                            avg = float(data['EndTime'].replace(",",".")) - float(data['StartTime'].replace(",","."))
                            old = float(ts["avg_time"]) * int(ts["count"])
                            suma = round(old + avg, 3)
                            count = int(ts["count"]) + 1
                            total = round(suma/count,3)
                            labels[data["Name"]][timestamp] = {"avg_time": total, "count": count, "type": "transaction"}
                        except:
                            avg = float(data['EndTime'].replace(",",".")) - float(data['StartTime'].replace(",","."))
                            labels[data["Name"]][timestamp] = {"avg_time": avg, "count": "1", "type": "transaction"}
            except:
                pass
            line_count += 1
        
        active_users = 0
        last = 0
        acum = 0
        for row in json02:
            try:
                write = False
                data = row["VuserInfo"]
                date_row = datetime.datetime.fromtimestamp(float(data['Timestamp'] + ".000"))
                date_row = date_row - datetime.timedelta(minutes=date_row.minute % 1, seconds=date_row.second)
                timestamp = int(datetime.datetime.timestamp(date_row)) * 1000
                if last == 0:
                    last = timestamp
                    op = "none"
                if timestamp != last:
                    if timestamp > last:
                        op = "sum"
                        diff = timestamp - last
                    else:
                        op = "sub"
                        diff = last - timestamp
                    last = timestamp
                if op == "sum":
                    acum += diff
                elif op == "sub":
                    acum -= diff
                timestamp = base_time + acum
                op = "none"
                if data["Type"] == "Run":
                    active_users += 1
                    write = True
                elif data["Type"] == "End":
                    active_users -= 1
                    write = True
                
                if write and "Vusers" not in labels:
                    minute_time = {"count": active_users, "type": "users"}
                    labels["Vusers"] = {timestamp: minute_time}
                elif write and "Vusers" in labels:
                    labels["Vusers"][timestamp] = {"count": active_users, "type": "users"}

            except:
                pass
            line_count += 1
        for i in labels:
            for j in labels[i]:
                if labels[i][j]["type"] == "transaction":
                    try:
                        scenario.transaction_set.create(
                            Name=i,
                            Timestamp=int(j),
                            Avg_time=float(round(float(labels[i][j]["avg_time"])/int(labels[i][j]["count"]),3)),
                            Txs_count=int(labels[i][j]["count"]),
                            Type=str(labels[i][j]["type"])
                        )
                    except Exception as e:
                        print(e)
                        break
                else:
                    try:
                        scenario.vuserinfo_set.create(
                            Name=i,
                            Timestamp=int(j),
                            Num_users = int(labels[i][j]["count"]), 
                            Type=str(labels[i][j]["type"])
                        )
                    except Exception as e:
                        print(e)
                        break

    except Exception as e:
        print("[WARN]", datetime.datetime.now(), "Something went wrong uploading execution")
        print("======================================================================================")
        print(e)
        print("======================================================================================")
    print("[INFO] File successfully uploaded")                



"""
Esta carga de escenarios si que lo hace en segundo plano
ya que lo permite mediante la carga de json. Puede que la 
memoria de los threads no se sobrepase por el tamaño de los archivos.
Habrá que investigar.
"""
def scenario_create_lr(request, user_name, app): #TODO hay que replantearse si vale la pena el hecho de hacerlo en segundo plano
    if(app == ""):
        request.session['msg'] = "Tienes que elegir una aplicación"
        print("-----------------------------------------------")
        print("[ERR] Aplicación no seleccionada")
        print("-----------------------------------------------")
        return redirect('/sgrw/' + str(request.user.username) + '/'+ app +'/add_scenario')
    
    fin01 = request.FILES['inputGroupFile01'].open('r')
    json01 = file_loader.load_json(fin01)
    fin02 = request.FILES['inputGroupFile02'].open('r')
    json02 = file_loader.load_json(fin02)
    if json01 == None or json02 == None:
        if json01 == None and json02 == None:
            msg = "Ambos archivos"
        elif json01 == None and json02 != None:
            msg = str(request.FILES['inputGroupFile01'])
        elif json01 != None and json02 == None:
            msg = str(request.FILES['inputGroupFile02'])
        print(msg, "corrupted json")
        request.session['msg'] = msg + " corrupto(s), no se ha podido cargar"
        return redirect('/sgrw/' + str(request.user.username) + '/'+ app +'/add_scenario')

    name = request.POST["escenarioNameLR"]
    name = name.replace(" ", "")
    print("-----------------------------------------------")
    print("[INFO] Creating scenario with name:", name)

    try:
        application = request.user.app_set.get(Name=app)
        exists = True
    except:
        exists = False
        print("[INFO] Creating new app with name:", app)

    if(exists):
        try:
            application.scenario_set.get(Name=name)
            scenario_exists = True
        except:
            scenario_exists = False
    else:
        scenario_exists = False
        application = request.user.app_set.create(Name=app)
    
    if not scenario_exists :
        scenario = application.scenario_set.create(Name=name) 
        
        dback = DjangoBackground()
        dback.add_app(target=insert_data, args=(scenario, json01, json02), name=app)
        dback.start_thread(app) 

        return redirect('/sgrw/' + str(request.user.username))
    else:
        print("[ERR] Scenario name already exists in app:", app)
        print("-----------------------------------------------")
        request.session["type"] = "danger"
        request.session['msg'] = "El nombre escogido ya existe: " + name
        return redirect('/sgrw/' + str(request.user.username) + '/'+ app +'/add_scenario')
    # return HttpResponse('ok')
    

def scenario_create_jmeter(request, user_name, app): #Esta función es código espagueti
    if(app == ""):
        request.session['msg'] = "Tienes que elegir una aplicación"
        print("-----------------------------------------------")
        print("[ERR] Aplicación no seleccionada")
        print("-----------------------------------------------")
        return redirect('/sgrw/' + str(request.user.username) + '/'+ app +'/add_scenario')

    fin01 = request.FILES['inputGroupFileJmeter01'].open('r')
    name = request.POST["escenarioNameJmeter"]
    name = name.replace(" ", "")
    print("-----------------------------------------------")
    print("[INFO] Creating scenario with name:", name)

    try:
        application = request.user.app_set.get(Name=app)
        exists = True
    except Exception as e:
        exists = False
        print("[INFO] Creating new app with name:", app)

    if(exists):
        try:
            application.scenario_set.get(Name=name)
            scenario_exists = True
        except:
            scenario_exists = False
        # scen = "scenario" + str(application.scenario_set.count() + 1)
        # print("scenario:", scen)
    else:
        scenario_exists = False
        application = request.user.app_set.create(Name=app)
    
    if not scenario_exists :
        scenario = application.scenario_set.create(Name=name) 
        try:
            line = fin01.readline() #TODO Aparentemente hay algún tipo de problema con leer del csv cuando se hace en segundo plano. Investigar. -> Puede tener que ver con la memoria asignada al thread
            line_count = 0
            labels = {}
            base_time = int(734184000000)
            last = 0
            acum = 0
            while line: 
                row = line.decode("ascii").split(",")
                if line_count != 0:
                    try:
                        date_row = datetime.datetime.fromtimestamp(float(row[0][:10] + "." + row[0][10:]))
                        date_row = date_row - datetime.timedelta(minutes=date_row.minute % 1, seconds=date_row.second)
                        timestamp = int(datetime.datetime.timestamp(date_row)) * 1000
                        if last == 0:
                            last = timestamp
                            op = "none"
                        if timestamp != last:
                            if timestamp > last:
                                op = "sum"
                                diff = timestamp - last
                            else:
                                op = "sub"
                                diff = last - timestamp
                            last = timestamp
                        if op == "sum":
                            acum += diff
                        elif op == "sub":
                            acum -= diff
                        timestamp = base_time + acum
                        op = "none"
                        if row[2] not in labels:
                            minute_time = {"avg_time": row[1], "count": "1", "type": "transaction"}
                            labels[row[2]] = {timestamp: minute_time}
                        else:
                            try:
                                ts = labels[row[2]][timestamp]
                                old = int(ts["avg_time"]) * int(ts["count"])
                                suma = round(old + int(row[1]), 3)
                                count = int(ts["count"]) + 1
                                total = round(suma/count,3)
                                labels[row[2]][timestamp] = {"avg_time": total, "count": count, "type": "transaction"}
                            except:
                                labels[row[2]][timestamp] = {"avg_time": row[1], "count": "1", "type": "transaction"}
                        if row[17] not in labels and row[17] != "0":
                            minute_time = {"count": row[12], "type": "users"}
                            labels[row[17]] = {timestamp: minute_time}
                        elif row[17] in labels:
                            try:
                                ts = labels[row[17]][timestamp]
                                if int(ts["count"]) < row[12]:
                                    count = row[12]
                                labels[row[17]][timestamp] = {"count": count, "type": "users"}
                            except:
                                labels[row[17]][timestamp] = {"count": row[12], "type": "users"}
                    except Exception as e:
                        print(e)
                else:
                    try:
                        hostname = row[17]
                        if hostname != "Hostname":
                            raise Exception
                    except Exception as e:
                        raise Exception('no hostname in .jtl file')

                line = fin01.readline()   
                line_count += 1
            for i in labels:
                for j in labels[i]:
                    if labels[i][j]["type"] == "transaction":
                        try:
                            scenario.transaction_set.create(
                                Name=i,
                                Timestamp=int(j),
                                Avg_time=float(round(float(labels[i][j]["avg_time"])/int(labels[i][j]["count"]),3)),
                                Txs_count=int(labels[i][j]["count"]),
                                Type=str(labels[i][j]["type"])
                            )
                        except Exception as e:
                            print(e)
                            break
                    else:
                        try:
                            scenario.vuserinfo_set.create(
                                Name=i,
                                Timestamp=int(j),
                                Num_users = int(labels[i][j]["count"]), #TODO los timestamp de jmeter son en milisegundos. En LR no. 
                                Type=str(labels[i][j]["type"])
                            )
                        except Exception as e:
                            print(e)
                            break
        except Exception as e:
            print("[WARN]", datetime.datetime.now(), "Something went wrong uploading execution")
            print("======================================================================================")
            print(e)
            print("======================================================================================")
            
            request.session['type'] = 'danger'
            request.session['msg'] = "Ha ocurrido algún problema en la carga del escenario"

            return redirect('/sgrw/' + str(request.user.username) + '/'+ app +'/add_scenario')
        print("[INFO] File successfully uploaded")
        print("[INFO] scenario created", name)
        print("-----------------------------------------------")
        request.session['type'] = 'success'
        request.session['msg'] = "Escenario " + name + " creado con exito"
        return redirect('/sgrw/' + str(request.user.username) + '/'+ app)
    else:
        print("[ERR] Scenario name already exists in app:", app)
        print("-----------------------------------------------")
        request.session['msg'] = "El nombre escogido ya existe: " + name
        return redirect('/sgrw/' + str(request.user.username) + '/'+ app +'/add_scenario')


def scenario_add(request, user_name, app_name):
    if(request.user.username == user_name):
        template = loader.get_template('IGAEapp/create_scenario.html')
        context = {}
        try:
            msg = request.session['msg']
        except KeyError:
            msg = None
        if msg is not None:
            context = {'msg': request.session['msg'], 'type': request.session["type"], 'app': app_name}
            del request.session['msg']
            del request.session["type"]
        else :
            context = {'app': app_name}
        return HttpResponse(template.render(context, request))
    else:
        return redirect('/sgrw/' + str(request.user.username) + '/' + app_name)

def remove_scenario(request, app_name, scenario_name): # borrado fiísico, podría valorarse el hacer el lógico 
    if request.user.is_authenticated:
        app = request.user.app_set.get(Name=app_name)
        scenarios = app.scenario_set.all()
        if len(scenarios) <= 1:
            request.session['type'] = "danger"
            request.session['msg'] = "No se puede borrar el único escenario que queda"

            return redirect('/sgrw/' + str(request.user.username) + '/' + app_name)

        scenario = app.scenario_set.get(Name=scenario_name)
        delete = scenario.delete()

        if delete[0] >= 1 :
            request.session['type'] = "success"
            request.session['msg'] = "¡Escenario "+ scenario_name +" borrado con exito!"
        else:
            request.session['type'] = "danger"
            request.session['msg'] = "¡Oops, algo ha pasado! Inténtelo más tarde."

        return redirect('/sgrw/' + str(request.user.username) + '/' + app_name)

def set_response(transactions, users, sc, res, tr):
    for t in transactions:
        label = t.Name
        if tr == "Select-all":
            label = tr
        res.append({"label": label, "transaction": t.Name, "timestamp": t.Timestamp, "avg_time": t.Avg_time, "txs_count": t.Txs_count, "scenario": sc, "type": "transaction"})
    if users is not None:
        for u in users:
            res.append({"label": u.Name, "timestamp": u.Timestamp, "num_users": u.Num_users, "scenario": sc, "type": "users"})

def calculate_averages(transactions, res):
    labels = list()
    for t in transactions:
        if t.Name not in labels:
            res[t.Name] = t.Txs_count
            labels.append(t.Name)
        else:
            old = res[t.Name]
            res[t.Name] = old + t.Txs_count

def scenario_search(request):
    if request.user.is_authenticated:
        app_name = request.GET.get('app', None)
        keys = request.GET.get('keys', None)
        if app_name is None or keys is None:
            return JsonResponse({"Error": "Missing arguments"}) 
        trans = keys.split(",")
        try:
            app = request.user.app_set.get(Name=app_name)
        except:
            return JsonResponse({"Error": "Bad request"})

        ur = list()
        t = list()
        sa = list()
        avgs = {}
        num_scenarios = list()
        transactions_name = list()
        for key in trans:
            data = key.split("$")
            sc = data[0]
            tr = data[1]
            users = None
            if sc not in num_scenarios:
                num_scenarios.append(sc)
            if key not in transactions_name:
                transactions_name.append(key)
            try:
                if sc not in sa:
                    scenario = app.scenario_set.get(Name=sc)
                    if tr != "Select-all":
                        transactions = scenario.transaction_set.filter(Name=tr)
                    else:
                        sa.append(sc)
                        transactions = scenario.transaction_set.all()
                    if sc not in ur:
                        users = scenario.vuserinfo_set.order_by('Timestamp')
                        ur.append(sc)
                    set_response(transactions, users, sc, t, tr)
                    calculate_averages(transactions, avgs)
            except Exception as e: 
                print(e)

        return JsonResponse({"scenarios": num_scenarios, "transactionsName": transactions_name, "transactions": t, "averages": avgs})
    else:
        return JsonResponse({"Error":"Insufficient privileges"})

def calculate_robot_mean(transactions):
    threshold = 5 # significa los minutos de media que aunará para calcular la media
    timestamps = 0
    last_timestamp = 734184000000
    count = 0
    ret = {}
    for transaction in transactions:
        if transaction.Timestamp != last_timestamp :
            last_timestamp = transaction.Timestamp
            threshold -= 1
            if threshold == 0:
                threshold = 5
                ret[last_timestamp] = timestamps / count
                timestamps = 0
                count = 0   
        count += 1
        timestamps += transaction.Avg_time
    return ret


def retrieve_robot_scenario(request) :
    if request.user.is_authenticated:
        app_name = request.GET.get('app', None)
        if app_name is None or app_name is "":
            return JsonResponse({"Error": "Missing arguments"})
        try:
            app = request.user.app_set.get(Name=app_name)
        except:
            return JsonResponse({"Error": "Bad request"})
        scenarios = app.scenario_set.all()
        ret = []
        for scenario in scenarios:
            transactions = scenario.transaction_set.all().order_by("Timestamp")
            tmp = calculate_robot_mean(transactions)
            for elem in tmp:
                ret.append({"timestamp": elem, "avg": tmp[elem]})
                
        return JsonResponse({"data": ret})
    else:
        return JsonResponse({"Error":"Insufficient privileges"})

# def get_txs_and_vusers(scenario):
#     try:
#         vusers = scenario.vuserinfo_set.order_by('Timestamp')
#         transactions = scenario.transaction_set.order_by('StartTime')
#         data = {}
#         trans = {}
#         total = {}
#         num_txs = []
#         count = 0
#         for vuser in vusers:
#             js = {"Timestamp": str(vuser.Timestamp), "Count":str(vuser.Count)}
#             data[count] = js
#             count += 1
#         total["Vusers"] = data
#         count = 0
#         for transaction in transactions:
#             js = {"Name": str(transaction.Name), "VuserGroup": str(transaction.VuserGroup), "Type": str(transaction.Type), "StartTime": str(transaction.StartTime), "EndTime": str(transaction.EndTime), "AverageTime": str(transaction.AverageTime), "ThinkTime": str(transaction.ThinkTime), "WastedTime": str(transaction.WastedTime), "Status": str(transaction.Status), "InstanceHandle": str(transaction.InstanceHandle), "ParentHandle": str(transaction.ParentHandle), "VuserID": str(transaction.VuserID)}
#             trans[count] = js
#             if transaction.Name not in num_txs:
#                 num_txs.append(transaction.Name)
#             count += 1
#         total["Transactions"] = trans
#         total["NumOfTxsType"] = len(num_txs)
#         total["txs_type"] = num_txs
#         total["scenario_complete"] = True
#         return total
#     except Exception as e:
#         print(e)
#         return None

# def scenario_complete_info_json(request, app_name, scenario_name): 
#     try:
#         total = {}
#         app = request.user.app_set.get(Name=app_name)
#         scenario = app.scenario_set.get(Name=scenario_name)
#         json = get_txs_and_vusers(scenario)
#         if(json == None): raise Exception
#         total[scenario_name+".Select-all"] = json
#         return JsonResponse(total, safe=False)
#     except Exception as e:
#         print(e)
#         return JsonResponse({"Error":"Something went wrong"})

# def get_txs(scenario, tx_name):
#     try:
#         transactions = scenario.transaction_set.order_by('StartTime').filter(Name=tx_name)
#         total = {}
#         data = {}
#         vusers = scenario.vuserinfo_set.order_by('Timestamp')
#         count = 0
#         for vuser in vusers:
#             js = {"Timestamp": str(vuser.Timestamp), "Count":str(vuser.Count)}
#             data[count] = js
#             count += 1
#         total["Vusers"] = data
#         total["txs_type"] = [tx_name]
#         trans = {}
#         count = 0
#         for transaction in transactions:
#             js = {"Name": str(transaction.Name), "VuserGroup": str(transaction.VuserGroup), "Type": str(transaction.Type), "StartTime": str(transaction.StartTime), "EndTime": str(transaction.EndTime), "AverageTime": str(transaction.AverageTime), "ThinkTime": str(transaction.ThinkTime), "WastedTime": str(transaction.WastedTime), "Status": str(transaction.Status), "InstanceHandle": str(transaction.InstanceHandle), "ParentHandle": str(transaction.ParentHandle), "VuserID": str(transaction.VuserID)}
#             trans[count] = js
#             count += 1
#         total["Transactions"] = trans
#         total["NumOfTxsType"] = 1
#         return total
#     except Exception as e:
#         print(e)
#         return None


# def all_scenarios_app_json_info(request, app_name):
#     try:
#         total = {}
#         app = request.user.app_set.get(Name=app_name)
#         scenarios = request.POST['scenarios'].split(",")
#         print(scenarios)
#         selected_all = []
#         for scen in scenarios:
#             data = scen.split(".")
#             sc = data[0]
#             tx = data[1]
#             scenario = app.scenario_set.get(Name=sc)
#             if(tx == 'Select-all'):
#                 json = get_txs_and_vusers(scenario)
#                 selected_all.append(sc)
#                 total[scen] = json
#             else:
#                 if(sc not in selected_all):
#                     json = get_txs(scenario, tx)
#                     total[scen] = json
#             if(json == None): raise Exception
#         return JsonResponse(total, safe=False)
#     except Exception as e:
#         print(e)
#         return JsonResponse({"Error":"Something went wrong"})

def new_app_handler(request, user_name):
    new_app = request.POST['new-app']
    if(request.user.username == user_name and new_app != ""):
        return redirect('/sgrw/' + str(request.user.username) + '/' + new_app + '/add_scenario')
    else :
        return redirect('/sgrw/' + str(request.user.username))
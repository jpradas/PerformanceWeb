import json
from ..models import Transaction, App, Scenario
from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponse, Http404, HttpResponseForbidden
from django.template import loader
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Count
from django.shortcuts import get_object_or_404, render, redirect
from ..models.App import App

def app_home(request, user_name, app_name):
    if request.user.username == user_name:
        user = User.objects.get(username=user_name)
        #user = get_object_or_404(User, pk=user_id)
        try:
            i = 0
            scenarios = list()
            app = user.app_set.get(Name=app_name)

            for apps in user.app_set.all():
                i += 1
            context = {
                'app': app,
            }
            for scenario in app.scenario_set.all():
                scen = {} 
                txs = scenario.transaction_set.values('Name').annotate(Count('Name'))   
                scen["Name"] = scenario.Name
                scen["txs"] = txs
                scenarios.append(scen)   
            context["scenarios"] = scenarios
            context["numApps"] = i
            
            try:
                msg = request.session['msg']
            except KeyError:
                msg = None
            if msg is not None:
                context['msg'] = request.session['msg']
                context["type"] = request.session["type"]
                del request.session['msg']
                del request.session["type"]

            template = loader.get_template('IGAEapp/app_home.html')
            response = HttpResponse(template.render(context, request)) 
            manage_apps(request, app_name, user_name)
            return response
        except App.DoesNotExist:
            return HttpResponseForbidden("App not assigned to this user")

    else:
        return HttpResponseForbidden("User access not granted")

def add_user_to_app(request, app_name):
    if request.user.is_staff and request.POST['username'] != "":
        try:
            user_name = request.POST['username']
            user = User.objects.get(username=user_name)
            app = App.objects.get(Name=app_name)
            app.users.add(user)
            #Necesario avisar en cliente que ha ocurrido (websockets) (routing, consumers, websocket_client)
            return redirect('/sgrw/' + str(request.user.username) + "/" + app_name)
        except User.DoesNotExist:
            return redirect('/sgrw/' + str(request.user.username) + "/" + app_name)
    else:
        return  HttpResponseForbidden("your user cannot do this")

def manage_apps(request, app_name, user_name):
    last_apps = request.session["last-apps"]
    # print("apps", last_apps)
    if user_name in last_apps:

        last_apps_user = last_apps[user_name]
        # last_apps = request.COOKIES['last-apps']
        new_list = list()
        for i in range(0,2):
            try:
                app = last_apps_user[i]
            except: 
                break
            # print(app)
            if app == app_name:
                new_list.insert(0, app)
            else:
                new_list.append(app)
        if len(new_list) == 0 or new_list[0] != app_name:
            new_list.insert(0, app_name)

        # print("last", last_apps_user) #debug
        # print("new list", new_list)
        last_apps[user_name] = new_list
        request.session['last-apps'] = last_apps
    else:
        # print("no last-apps for this user") #debug
        user_profile = list()
        user_profile.append(app_name)
        last_apps[user_name] = user_profile
        request.session["last-apps"] = last_apps
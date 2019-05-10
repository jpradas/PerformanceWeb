from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.template import loader
from django.http import HttpResponse, Http404, HttpResponseForbidden

from functools import wraps

# class persist_session_vars(object):
#     """ Some views, such as login and logout, will reset all session state.
#     However, we occasionally want to persist some of those session variables.
#     """

#     session_backup = {}

#     def __init__(self, vars):
#         self.vars = vars

#     def __enter__(self):
#         for var in self.vars:
#             self.session_backup[var] = self.request.session.get(var)

#     def __exit__(self, exc_type, exc_value, traceback):
#         for var in self.vars:
#             self.request.session[var] = self.session_backup.get(var)

#     def __call__(self, test_func, *args, **kwargs):

#         @wraps(test_func)
#         def inner(*args, **kwargs):
#             if not args:
#                 raise Exception('Must decorate a view, ie a function taking request as the first parameter')
#             self.request = args[0]
#             with self:
#                 return test_func(*args, **kwargs)

#         return inner

def index(request):
    #comprobar que no exista una sesión ya, en caso contrario, redireccionar a user_home
    if request.user.is_authenticated: 
        return redirect('/sgrw/' + str(request.user.username))
    else :
        template = loader.get_template('IGAEapp/index.html')
        context = {}
        try:
            msg = request.session['msg']
        except KeyError:
            msg = None
        if msg is not None:
            context = {'msg': request.session['msg'], 'type': request.session['type']}
            del request.session['msg']
            del request.session['type']

        return HttpResponse(template.render(context, request))

# @persist_session_vars(['last-apps'])
def user_login(request):
    #user = User.objects.get(Name=request.POST['username'])
    user = authenticate(request, username=request.POST['username'], password=request.POST['password'])
    if user is not None:
        last_apps = None
        try:
            last_apps = request.session["last-apps"]
        except:
            pass
        login(request, user)
        if last_apps == None:
            last_apps = {}
        request.session["last-apps"] = last_apps
        print("login", request.session["last-apps"])
        return redirect('/sgrw/' + str(user.username))
    else:
        request.session['msg'] = "User or Password isn't correct"
        request.session['type'] = "danger"
        return redirect('/sgrw/')
        
# @persist_session_vars(['last-apps'])
def user_logout(request):
    last_apps = request.session["last-apps"]
    logout(request)
    request.session["last-apps"] = last_apps
    request.session['msg'] = "User loged out succesfully"
    request.session['type'] = "success"
    return redirect('/sgrw/')
    #return HttpResponse("Soy " + request.POST['username'] + " y mi contraseña es " + request.POST['password'])


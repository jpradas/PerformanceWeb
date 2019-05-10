from django.contrib.auth.models import User
from django.template import loader
from django.http import HttpResponse, Http404, HttpResponseForbidden

def user_home(request, user_name):
    if request.user.username == user_name:
        try: 
            user = User.objects.get(username=user_name)
        except:
            return HttpResponseForbidden("User doesn't exist")
        #user = get_object_or_404(User, pk=user_id)
        if request.user.is_authenticated:
            template = loader.get_template('IGAEapp/user_home.html')
            try:
                last_apps = request.session['last-apps'][user_name]
            except:
                request.session['last-apps'][user_name] = []
                last_apps = []
            print("user_home", last_apps)
            context = {
                'user': user,
                'last_apps': last_apps,
            }
            return HttpResponse(template.render(context, request))
        else:
            return HttpResponseForbidden("User not loged in")
    else:
        print(request.user)
        return HttpResponseForbidden("User access not granted")
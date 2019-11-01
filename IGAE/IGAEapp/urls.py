from django.urls import path
import subprocess
from .controllers import login_ctrl, user_ctrl, scenario_ctrl, app_ctrl

app_name = 'SGRW'
urlpatterns = [
    path('', login_ctrl.index, name='index'),
    path('<str:user_name>/', user_ctrl.user_home, name='user_home'),
    path('<str:user_name>/<str:app_name>/', app_ctrl.app_home, name='app_home'),
    #path('scenario_form', scenario_ctrl.scenario_form, name='scenario_form'),
    path('user_login', login_ctrl.user_login, name='user_login'),
    path('user_logout', login_ctrl.user_logout, name='user_logout'),
    path('<str:user_name>/<str:app_name>/add_scenario', scenario_ctrl.scenario_add, name='add_scenario'),
    path('<str:app_name>/<str:scenario_name>/remove_scenario', scenario_ctrl.remove_scenario, name='remove_scenario'),
    path('<str:user_name>/<str:app>/scenario_create_lr', scenario_ctrl.scenario_create_lr, name='scenario_create_lr'),
    path('<str:user_name>/<str:app>/scenario_create_jmeter', scenario_ctrl.scenario_create_jmeter, name='scenario_create_jmeter'),
    # path('api/<str:app_name>/<str:scenario_name>', scenario_ctrl.scenario_complete_info_json, name='scenario_info_json'),
    # path('api/<str:app_name>/scenario/all', scenario_ctrl.all_scenarios_app_json_info, name='all_scenarios_app_info_json'),
    path('api/scenario/search',scenario_ctrl.scenario_search, name='scenario_search'),
    path('api/robot_scenario/show',scenario_ctrl.retrieve_robot_scenario, name='retrieve_robot_scenario'),
    path('<str:user_name>/new_app_handler', scenario_ctrl.new_app_handler, name='new_app_handler'),
    path('add_user/<str:app_name>', app_ctrl.add_user_to_app, name='add_user_to_app'),
]

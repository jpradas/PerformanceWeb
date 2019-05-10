from djongo import models
from django.contrib.auth.models import User

class App(models.Model):
    users = models.ManyToManyField(User)
    Name = models.CharField(max_length=50)

    def __str__(self):
        return self.Name
    
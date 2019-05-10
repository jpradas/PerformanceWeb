from djongo import models
from .App import App

class Scenario(models.Model):
    app = models.ForeignKey(App, on_delete=models.CASCADE)
    Name = models.CharField(max_length=50)

    def __str__(self):
        return self.Name
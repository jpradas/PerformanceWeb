from djongo import models
from .Scenario import Scenario

class VuserInfo(models.Model):
    scenario = models.ForeignKey(Scenario, on_delete=models.CASCADE)
    Name = models.CharField(max_length=100, default="default")
    Timestamp = models.BigIntegerField(default=0)
    Num_users = models.IntegerField(default=0)
    Type = models.CharField(max_length=100, default="default")
    
    def __str__(self):
        return self.Count

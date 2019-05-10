from djongo import models
from .Scenario import Scenario

class Transaction(models.Model):
    scenario = models.ForeignKey(Scenario, on_delete=models.CASCADE)
    Name = models.CharField(max_length=100)
    Timestamp = models.BigIntegerField(default=0)
    Avg_time = models.FloatField(default=0)
    Txs_count = models.IntegerField(default=0)
    Type = models.CharField(max_length=100)
    # VuserGroup = models.CharField(max_length=100)
    # Type = models.IntegerField(default=0)
    # StartTime = models.FloatField(default=0.0)
    # EndTime = models.FloatField(default=0.0)
    # AverageTime = models.FloatField(default=0.0)
    # ThinkTime = models.FloatField(default=0.0)
    # WastedTime = models.FloatField(default=0.0)
    # Status = models.IntegerField(default=0)
    # InstanceHandle = models.BigIntegerField(default=0)
    # ParentHandle = models.BigIntegerField(default=0)
    # VuserID = models.IntegerField(default=0)

    def __str__(self):
        return self.Name

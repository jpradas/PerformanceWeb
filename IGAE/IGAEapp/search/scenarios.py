from django_elasticsearch_dsl import DocType, Index
from django_elasticsearch_dsl.registries import registry 
from ..models import Scenario

scenarios = Index('scenarios')

@scenarios.doc_type
class ScenarioDocument(DocType):
    class Meta:
        model = Scenario

        fields = [
            'app',
            'Name',
        ]

        
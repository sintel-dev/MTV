from datetime import datetime

from mongoengine import Document, fields

from mtv.utils import remove_dots, restore_dots


class MongoUtils:
    """Mixin that provides additional query methods."""

    insert_time = fields.DateTimeField(default=datetime.utcnow)

    @classmethod
    def find(cls, only_=None, exclude_=None, **kwargs):
        cursor = cls.objects(**kwargs)
        if only_:
            cursor = cursor.only(*only_)

        if exclude_:
            cursor = cursor.exclude(*exclude_)

        return cursor

    @classmethod
    def find_one(cls, **kwargs):
        return cls.find(**kwargs).first()

    @classmethod
    def last(cls, **kwargs):
        return cls.find(**kwargs).order_by('-insert_time').first()

    @classmethod
    def insert(cls, **kwargs):
        kwargs_copy = kwargs.copy()
        if 'name' in kwargs_copy:
            name = kwargs_copy.pop('name')
            document = cls.find_one(name=name)
            if document:
                raise ValueError(
                    '{} with name="{}" already exists'.format(
                        cls.__name__, name))

        document = cls.find_one(**kwargs)
        if document is not None:
            fields = ' and '.join('{}={}'.format(k, v)
                                  for k, v in kwargs_copy.items())
            raise ValueError(
                '{} with {} already exists'.format(
                    cls.__name__, fields))

        document = cls(**kwargs)
        document.save()

        return document

    @classmethod
    def insert_many(cls, docs):
        # todo: need validation
        wrapped_docs = [cls(**d) for d in docs]
        cls.objects.insert(wrapped_docs)

    @classmethod
    def find_or_insert(cls, **kwargs):
        document = cls.find_one(**kwargs)
        if document is None:
            document = cls.insert(**kwargs)

        return document


def key_has_dollar(d):
    """Helper function to recursively determine if any key in a
    dictionary contains a dollar sign.
    """
    for k, v in d.items():
        if k.startswith('$') or (isinstance(v, dict) and key_has_dollar(v)):
            return True


class PipelineField(fields.DictField):

    def to_mongo(self, value, use_db_field=True, fields=None):
        value = remove_dots(value)
        return super().to_mongo(value, use_db_field, fields)

    def to_python(self, value):
        value = restore_dots(value)
        return super().to_python(value)

    def validate(self, value):
        """Make sure that a list of valid fields is being used."""
        if not isinstance(value, dict):
            self.error('Only dictionaries may be used in a PipelineField')

        if fields.key_not_string(value):
            msg = ('Invalid dictionary key - documents must '
                   'have only string keys')
            self.error(msg)

        if key_has_dollar(value):
            self.error('Invalid dictionary key name - keys may not start with '
                       '"$" character')

        super(fields.DictField, self).validate(value)


class Dataset(Document, MongoUtils):
    name = fields.StringField(required=True)
    entity_id = fields.StringField()


class Signal(Document, MongoUtils):
    name = fields.StringField(required=True)
    dataset = fields.ReferenceField(Dataset)
    start_time = fields.IntField()
    stop_time = fields.IntField()
    data_location = fields.StringField()
    timestamp_column = fields.IntField()
    value_column = fields.IntField()
    created_by = fields.StringField()


class Pipeline(Document, MongoUtils):
    name = fields.StringField(required=True)
    mlpipeline = PipelineField(required=True)
    created_by = fields.StringField()


class Experiment(Document, MongoUtils):
    project = fields.StringField()
    pipeline = fields.ReferenceField(Pipeline)
    dataset = fields.ReferenceField(Dataset)
    created_by = fields.StringField()


class Datarun(Document, MongoUtils):
    experiment = fields.ReferenceField(Experiment)
    signal = fields.ReferenceField(Signal)
    start_time = fields.DateTimeField(required=True)
    end_time = fields.DateTimeField()
    software_versions = fields.ListField(fields.StringField())
    budget_type = fields.StringField()
    budget_amount = fields.IntField()
    model_location = fields.StringField()
    metrics_location = fields.StringField()
    events = fields.IntField()
    status = fields.StringField()


class Event(Document, MongoUtils):
    datarun = fields.ReferenceField(Datarun)
    start_time = fields.IntField(required=True)
    stop_time = fields.IntField(required=True)
    score = fields.FloatField()
    tag = fields.StringField()


class Comment(Document, MongoUtils):
    event = fields.ReferenceField(Event)
    text = fields.StringField(required=True)
    created_by = fields.StringField()


class Raw(Document, MongoUtils):
    datarun = fields.ReferenceField(Signal)
    timestamp = fields.FloatField()
    year = fields.IntField()
    data = fields.ListField(fields.ListField())
    meta = {
        'indexes': [
            'datarun',
            ('datarun', '+year')
        ]
    }


class Prediction(Document, MongoUtils):
    signal = fields.ReferenceField(Signal)
    datarun = fields.ReferenceField(Datarun)
    names = fields.ListField(fields.StringField())
    data = fields.ListField(fields.ListField(fields.FloatField()))
    meta = {
        'indexes': [
            'datarun'
        ]
    }


class Test(Document, MongoUtils):
    name = fields.StringField(required=True)

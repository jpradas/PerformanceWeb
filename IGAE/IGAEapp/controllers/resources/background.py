import threading

class Singleton(type):

    def __init__(cls, name, bases, attrs, **kwargs):
        super().__init__(name, bases, attrs)
        cls.__instance = None
    
    def __call__(cls, *args, **kwargs):
        if cls.__instance is None:
            cls.__instance = super().__call__(*args, **kwargs)
        return cls.__instance

class DjangoBackground(metaclass=Singleton):
        
        def __init__(self):
            self.apps = dict()
            self.lock = threading.Lock()

        def add_app(self, target, args, name):
            thread = threading.Thread(target=target, args=args, name=name)
            self.lock.acquire()
            self.apps[name] = thread
            self.lock.release()

        def start_thread(self, name):
            self.lock.acquire()
            self.apps[name].start()
            self.lock.release()

        def get_progress(self, name):
            self.lock.acquire()
            try:
                ret = self.apps[name].is_alive()
                self.lock.release()
                return ret
            except: 
                self.lock.release()
                return None
        
        def __str__(self):
            return repr(self)

    
    # def __init__(self):
    #     if not DjangoBackground.instance:
    #         DjangoBackground.instance = DjangoBackground.__DjangoBackground()

    # def start(self, target, args, name):
    #     self.instance.__add_app(target, args, name)
    #     self.instance.__start_thread(name)

    # def get_progress(self, name):
    #     return self.instance.__get_progress(name)

    # def __getattr__(self, name):
    #     return getattr(self.instance, name)
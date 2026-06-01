from django.shortcuts import redirect

class ReactRedirectMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path == "/":
            return redirect("http://localhost:5173/")
        return self.get_response(request)

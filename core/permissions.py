from rest_framework.permissions import BasePermission


class PaidUser(BasePermission):
    def has_permission(self, request, view):
        if request.user.active_subscription:
            return True

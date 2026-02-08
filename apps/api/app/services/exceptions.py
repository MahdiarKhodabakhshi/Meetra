class ServiceError(Exception):
    pass


class NotFoundError(ServiceError):
    pass


class PermissionDeniedError(ServiceError):
    pass


class ConflictError(ServiceError):
    pass


class ValidationError(ServiceError):
    pass

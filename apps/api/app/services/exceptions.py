class ServiceError(Exception):
    def __init__(self, code: str, message: str | None = None) -> None:
        self.code = code
        self.message = message or code
        super().__init__(self.message)


class NotFoundError(ServiceError):
    pass


class PermissionDeniedError(ServiceError):
    pass


class ConflictError(ServiceError):
    pass


class ValidationError(ServiceError):
    pass

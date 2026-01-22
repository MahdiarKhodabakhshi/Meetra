from fastapi import HTTPException

from app.services.exceptions import (
    ConflictError,
    NotFoundError,
    PermissionDeniedError,
    ServiceError,
    ValidationError,
)


def http_error_from_service(err: ServiceError) -> HTTPException:
    if isinstance(err, NotFoundError):
        status = 404
    elif isinstance(err, PermissionDeniedError):
        status = 403
    elif isinstance(err, ConflictError):
        status = 409
    elif isinstance(err, ValidationError):
        status = 422
    else:
        status = 500

    return HTTPException(
        status_code=status,
        detail={"code": err.code, "message": err.message},
    )

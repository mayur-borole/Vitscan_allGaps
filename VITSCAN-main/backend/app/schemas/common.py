from pydantic import BaseModel


class ApiSuccessResponse(BaseModel):
    status: str = "success"
    data: dict


class ApiErrorResponse(BaseModel):
    status: str = "error"
    message: str

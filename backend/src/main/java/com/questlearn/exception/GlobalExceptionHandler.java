package com.questlearn.exception;

import com.questlearn.dto.response.ApiResponse;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Provider
public class GlobalExceptionHandler implements ExceptionMapper<Exception> {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @Override
    public Response toResponse(Exception ex) {
        if (ex instanceof ResourceNotFoundException) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(ApiResponse.error(ex.getMessage()))
                    .build();
        }
        if (ex instanceof BadRequestException) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(ApiResponse.error(ex.getMessage()))
                    .build();
        }
        if (ex instanceof io.quarkus.security.UnauthorizedException) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(ApiResponse.error("Unauthorized: " + ex.getMessage()))
                    .build();
        }
        if (ex instanceof io.quarkus.security.ForbiddenException) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity(ApiResponse.error("Forbidden: " + ex.getMessage()))
                    .build();
        }
        log.error("Unhandled exception", ex);
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(ApiResponse.error("Internal error: " + ex.getMessage()))
                .build();
    }
}

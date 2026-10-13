package com.questlearn.controller;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.file.Files;

@Path("/uploads")
public class UploadResource {

    private static final Logger log = LoggerFactory.getLogger(UploadResource.class);

    @ConfigProperty(name = "app.upload.dir", defaultValue = "./uploads")
    String uploadDir;

    @GET
    @Path("/{filename}")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response getFile(@PathParam("filename") String filename) {
        if (filename.contains("..") || filename.contains("/")) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        try {
            java.nio.file.Path dir = java.nio.file.Paths.get(uploadDir).toAbsolutePath().normalize();
            java.nio.file.Path file = dir.resolve(filename).normalize();
            if (!Files.exists(file) || !file.startsWith(dir)) {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
            byte[] content = Files.readAllBytes(file);
            String contentType = Files.probeContentType(file);
            return Response.ok(content)
                    .type(contentType != null ? contentType : MediaType.APPLICATION_OCTET_STREAM)
                    .build();
        } catch (Exception e) {
            log.error("Error serving upload file: {}", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }
}

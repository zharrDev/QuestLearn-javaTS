package com.questlearn.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.questlearn.dto.request.SoalRequest;
import com.questlearn.dto.response.ApiResponse;
import com.questlearn.exception.BadRequestException;
import com.questlearn.service.SoalService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.jboss.resteasy.reactive.MultipartForm;
import org.jboss.resteasy.reactive.PartType;
import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.io.IOException;
import java.nio.file.Files;

@Path("/api/admin/soal")
@Produces(MediaType.APPLICATION_JSON)
public class SoalMultipartResource {

    @Inject
    SoalService soalService;

    @Inject
    ObjectMapper objectMapper;

    public static class SoalMultipartForm {
        @RestForm("data")
        @PartType(MediaType.APPLICATION_JSON)
        public String data;

        @RestForm("file")
        public FileUpload file;
    }

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response create(@MultipartForm SoalMultipartForm form) {
        SoalRequest req = parseData(form.data);
        byte[] fileBytes = readFile(form.file);
        return Response.ok(ApiResponse.success("Soal dibuat",
                soalService.create(req, fileBytes, fileName(form.file)))).build();
    }

    @PUT
    @Path("/{id}")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public Response update(@PathParam("id") Long id, @MultipartForm SoalMultipartForm form) {
        SoalRequest req = parseData(form.data);
        byte[] fileBytes = readFile(form.file);
        return Response.ok(ApiResponse.success("Soal diupdate",
                soalService.update(id, req, fileBytes, fileName(form.file)))).build();
    }

    private SoalRequest parseData(String data) {
        if (data == null || data.isBlank()) throw new BadRequestException("Field 'data' wajib diisi");
        try {
            return objectMapper.readValue(data, SoalRequest.class);
        } catch (IOException e) {
            throw new BadRequestException("Format data tidak valid: " + e.getMessage());
        }
    }

    private byte[] readFile(FileUpload file) {
        if (file == null || file.size() == 0) return null;
        try {
            return Files.readAllBytes(file.uploadedFile());
        } catch (IOException e) {
            throw new BadRequestException("Gagal membaca file: " + e.getMessage());
        }
    }

    private String fileName(FileUpload file) {
        return file != null ? file.fileName() : null;
    }
}

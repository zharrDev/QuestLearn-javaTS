
package com.questlearn.service.impl;

import com.questlearn.exception.BadRequestException;
import com.questlearn.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    public String storeFile(byte[] fileData, String originalFilename) {
        if (fileData == null || fileData.length == 0) throw new BadRequestException("File kosong");
        String fileName = originalFilename != null ? originalFilename : "file";
        fileName = fileName.replace("\\", "/");
        int slash = fileName.lastIndexOf('/');
        if (slash >= 0) fileName = fileName.substring(slash + 1);
        if (fileName.contains("..")) throw new BadRequestException("Invalid path");
        int i = fileName.lastIndexOf('.');
        String ext = (i > 0) ? fileName.substring(i) : "";
        String newName = UUID.randomUUID() + ext;
        try {
            Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(dir);
            Path target = dir.resolve(newName);
            Files.write(target, fileData);
            return "/uploads/" + newName;
        } catch (IOException e) {
            throw new BadRequestException("Gagal menyimpan file: " + e.getMessage());
        }
    }
}

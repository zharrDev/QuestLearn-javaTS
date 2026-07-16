
package com.questlearn.service.impl;

import com.questlearn.exception.BadRequestException;
import com.questlearn.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) throw new BadRequestException("File kosong");
        String fileName = StringUtils.cleanPath(file.getOriginalFilename());
        if (fileName.contains("..")) throw new BadRequestException("Invalid path");
        String ext = "";
        int i = fileName.lastIndexOf('.');
        if (i > 0) ext = fileName.substring(i);
        String newName = UUID.randomUUID() + ext;
        try {
            Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(dir);
            Path target = dir.resolve(newName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + newName;
        } catch (IOException e) {
            throw new BadRequestException("Gagal menyimpan file: " + e.getMessage());
        }
    }
}

package com.questlearn.service;
public interface FileStorageService {
    String storeFile(byte[] fileData, String originalFilename);
}

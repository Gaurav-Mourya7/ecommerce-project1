package com.halo.ecommerce.Controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/static")
public class StaticImageController {

    private static final String UPLOAD_DIR = "backend/src/main/resources/static/upload/";

    @GetMapping("/images")
    public ResponseEntity<List<String>> getAvailableImages() {
        try {
            // Try to get from classpath first, then fallback to file system
            List<String> imageFiles = new ArrayList<>();
            
            // Check file system path for uploaded images
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (Files.exists(uploadPath)) {
                try (var stream = Files.list(uploadPath)) {
                    stream.filter(Files::isRegularFile)
                          .filter(path -> isImageFile(path.getFileName().toString()))
                          .forEach(path -> imageFiles.add("images/" + path.getFileName().toString()));
                }
            }
            
            // Also check classpath resources
            try {
                ClassPathResource resource = new ClassPathResource("static/images");
                if (resource.exists()) {
                    File imagesDir = resource.getFile();
                    if (imagesDir.exists() && imagesDir.isDirectory()) {
                        File[] files = imagesDir.listFiles();
                        if (files != null) {
                            Arrays.stream(files)
                                .filter(file -> file.isFile())
                                .filter(file -> isImageFile(file.getName()))
                                .forEach(file -> {
                                    String imagePath = "images/" + file.getName();
                                    if (!imageFiles.contains(imagePath)) {
                                        imageFiles.add(imagePath);
                                    }
                                });
                        }
                    }
                }
            } catch (IOException ignored) {
                // Classpath resource might not be accessible in JAR
            }
            
            return new ResponseEntity<>(imageFiles, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<List<String>> uploadImages(@RequestParam("files") MultipartFile[] files) {
        List<String> uploadedFiles = new ArrayList<>();
        
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;
                
                String originalFilename = file.getOriginalFilename();
                if (originalFilename != null && isImageFile(originalFilename)) {
                    // Generate unique filename to avoid conflicts
                    String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
                    String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
                    
                    Path filePath = uploadPath.resolve(uniqueFilename);
                    Files.copy(file.getInputStream(), filePath);
                    
                    String imagePath = "upload/" + uniqueFilename;
                    uploadedFiles.add(imagePath);
                }
            }
            
            return new ResponseEntity<>(uploadedFiles, HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    private boolean isImageFile(String fileName) {
        String lowerCase = fileName.toLowerCase();
        return lowerCase.endsWith(".jpg") || 
               lowerCase.endsWith(".jpeg") || 
               lowerCase.endsWith(".png") || 
               lowerCase.endsWith(".gif") || 
               lowerCase.endsWith(".webp");
    }
}

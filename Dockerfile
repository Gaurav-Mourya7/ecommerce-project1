# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy backend pom.xml and download dependencies
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Copy backend source code and build
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/target/ecommerce-0.0.1-SNAPSHOT.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run application with optimized JVM settings
ENTRYPOINT ["java", "-Xmx512m", "-Xms256m", "-jar", "app.jar"]
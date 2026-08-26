# Stage 1: Build JAR with Maven & Java 21
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
COPY .mvn .mvn
COPY src src

# Build executable jar
RUN apk add --no-cache maven && \
    mvn clean package -DskipTests

# Stage 2: Lightweight Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S ehub && adduser -S ehub -G ehub
USER ehub

COPY --from=builder /app/target/ehub-backend-1.0.0.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

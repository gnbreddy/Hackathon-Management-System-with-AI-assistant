# Stage 1: Build JAR with Maven & Java 21
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Install Maven
RUN apk add --no-cache maven

# Copy POM and sources
COPY pom.xml .
COPY src ./src

# Build executable jar
RUN mvn clean package -DskipTests

# Stage 2: Lightweight Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S ehub && adduser -S ehub -G ehub
USER ehub

COPY --from=builder /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

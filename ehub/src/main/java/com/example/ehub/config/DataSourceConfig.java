package com.example.ehub.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Converts Railway's DATABASE_URL (postgresql://user:pass@host:port/db)
 * into a proper JDBC DataSource.
 *
 * If DATABASE_URL is not set, Spring Boot's auto-configuration kicks in
 * and uses the standard spring.datasource.* properties (for local Docker
 * Compose).
 */
@Configuration
public class DataSourceConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Bean
    @Primary
    @ConditionalOnProperty(name = "DATABASE_URL", matchIfMissing = false)
    public DataSource railwayDataSource() {
        if (databaseUrl == null || databaseUrl.isBlank()) {
            return null; // Let Spring Boot autoconfigure handle it
        }

        try {
            // Strip the "postgresql://" prefix to parse as a URI
            URI uri = new URI(databaseUrl.replace("postgresql://", "http://"));
            String host = uri.getHost();
            int port = uri.getPort() == -1 ? 5432 : uri.getPort();
            String path = uri.getPath(); // "/dbname"
            String db = path.startsWith("/") ? path.substring(1) : path;
            String[] userInfo = uri.getUserInfo() != null ? uri.getUserInfo().split(":", 2) : new String[] { "", "" };
            String username = userInfo[0];
            String password = userInfo.length > 1 ? userInfo[1] : "";

            String jdbcUrl = String.format("jdbc:postgresql://%s:%d/%s", host, port, db);

            HikariDataSource ds = new HikariDataSource();
            ds.setJdbcUrl(jdbcUrl);
            ds.setUsername(username);
            ds.setPassword(password);
            ds.setDriverClassName("org.postgresql.Driver");
            ds.setMaximumPoolSize(5);
            ds.setConnectionTimeout(30000);
            return ds;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse DATABASE_URL: " + databaseUrl, e);
        }
    }
}

package com.example.ehub.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/ehub_db}")
    private String rawUrl;

    @Value("${spring.datasource.username:ehub_user}")
    private String defaultUsername;

    @Value("${spring.datasource.password:ehub_password}")
    private String defaultPassword;

    @Value("${spring.datasource.driver-class-name:org.postgresql.Driver}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        String jdbcUrl = rawUrl;
        String username = defaultUsername;
        String password = defaultPassword;

        // Automatically convert Render / Railway / Heroku postgres:// or postgresql:// URLs into jdbc:postgresql://
        if (rawUrl != null && (rawUrl.startsWith("postgres://") || (rawUrl.startsWith("postgresql://") && !rawUrl.startsWith("jdbc:postgresql://")))) {
            try {
                String cleanUrl = rawUrl.startsWith("postgres://")
                        ? rawUrl.substring("postgres://".length())
                        : rawUrl.substring("postgresql://".length());

                URI uri = new URI("scheme://" + cleanUrl);

                String host = uri.getHost();
                int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                String path = uri.getPath();
                String query = uri.getQuery();

                if (uri.getUserInfo() != null) {
                    String[] userInfo = uri.getUserInfo().split(":");
                    username = userInfo[0];
                    if (userInfo.length > 1) {
                        password = userInfo[1];
                    }
                }

                jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                if (query != null && !query.isEmpty()) {
                    jdbcUrl += "?" + query;
                }

                logger.info("Transformed cloud postgres URL into JDBC URL: jdbc:postgresql://{}:{}{}", host, port, path);
            } catch (Exception e) {
                logger.warn("Could not parse cloud database URI {}. Falling back with 'jdbc:' prefix.", e.getMessage());
                if (!rawUrl.startsWith("jdbc:")) {
                    jdbcUrl = "jdbc:" + rawUrl;
                }
            }
        }

        config.setJdbcUrl(jdbcUrl);
        config.setUsername(username);
        config.setPassword(password);

        if (jdbcUrl.contains("h2:mem") || jdbcUrl.contains("jdbc:h2:")) {
            config.setDriverClassName("org.h2.Driver");
        } else {
            config.setDriverClassName(driverClassName);
        }

        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);

        return new HikariDataSource(config);
    }
}

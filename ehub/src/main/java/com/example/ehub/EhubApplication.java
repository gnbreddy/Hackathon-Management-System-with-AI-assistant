package com.example.ehub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class EhubApplication {

	public static void main(String[] args) {
		SpringApplication.run(EhubApplication.class, args);
	}

}

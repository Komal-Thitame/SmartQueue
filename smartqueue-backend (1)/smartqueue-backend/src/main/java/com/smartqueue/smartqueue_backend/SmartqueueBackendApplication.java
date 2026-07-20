package com.smartqueue.smartqueue_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = { SecurityAutoConfiguration.class }) // Yeh line badal dijiye
public class SmartqueueBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartqueueBackendApplication.class, args);
	}
}
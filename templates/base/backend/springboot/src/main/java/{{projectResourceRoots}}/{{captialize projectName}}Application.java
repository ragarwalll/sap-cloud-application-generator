package {{projectNamespace}}.{{projectName}};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class {{captialize projectName}}Application {

	public static void main(String[] args) {
		SpringApplication.run({{captialize projectName}}Application.class, args);
	}

}

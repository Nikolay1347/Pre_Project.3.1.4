package org.example.role.configs;

import jakarta.annotation.PostConstruct;
import org.example.role.model.Role;
import org.example.role.model.User;
import org.example.role.repositories.RoleRepository;
import org.example.role.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class DataInitializer {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void init() {
        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_ADMIN")));

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> roleRepository.save(new Role("ROLE_USER")));


        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setActive(true);
            admin.setRoles(Set.of(adminRole, userRole));
            userRepository.save(admin);
        }

//        if (!userRepository.findByUsername("user").isPresent()) {
//            User user = new User();
//            user.setUsername("user");
//            user.setPassword(passwordEncoder.encode("user"));
//            user.setActive(true);
//            user.setRoles(Set.of(userRole));
//            userRepository.save(user);
//        }
    }
}
